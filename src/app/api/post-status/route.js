import dbConnect from "@/lib/dbConnect";
import Post from "@/models/PostStatus";

// Helper to return JSON response
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/**
 * GET -> Fetch posts by userId (e.g., MB-02) and optional status
 * Query: ?userId=MB-02&status=pending&id=123
 */
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId"); // ✅ now passed in query

    if (!userId) return json({ success: false, error: "userId required" }, 400);

    // ✅ Single post fetch
    if (id) {
      const post = await Post.findOne({ _id: id, userId }).lean();
      if (!post) return json({ success: false, error: "Post not found" }, 404);
      return json({ success: true, data: post });
    }

    // ✅ Multiple posts fetch
    const query = { userId };
    if (status) query.status = status;

    const posts = await Post.find(query).sort({ createdAt: -1 }).lean();
    return json({ success: true, data: posts });
  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}

/**
 * POST -> Create a new post
 * Body: { userId: "MB-02", prompt, output?, status? }
 */
export async function POST(req) {
  try {
    await dbConnect();

    const { userId, status,aiOutput,description,promat } = await req.json();
    if (!userId  || !aiOutput || !description) {
      return json({ success: false, error: "userId and prompt are required" }, 400);
    }

    const newPost = await Post.create({
      userId,
      aiOutput,
      description,
      promat,
      status: status || "pending",
    });

    return json({ success: true, data: newPost }, 201);
  } catch (err) {
    console.error("Error saving post:", err);
    return json({ success: false, error: err.message }, 500);
  }
}

/**
 * PUT -> Update post (status, scheduledDate)
 * Body: { id, userId: "MB-02", status, scheduledDate? }
 */
export async function PUT(req) {
  try {
    await dbConnect();

    const { id, status, scheduledDate, userId, description, reason } = await req.json();

    if (!id || !status || !userId) {
      return json({ success: false, error: "id, status & userId required" }, 400);
    }

    const updateData = { status };

    // --- Scheduled ---
    if (status === "scheduled") {
      if (!scheduledDate) {
        return json(
          { success: false, error: "scheduledDate required when scheduling" },
          400
        );
      }

      updateData.scheduledDate = new Date(scheduledDate);
      if (isNaN(updateData.scheduledDate.getTime())) {
        return json({ success: false, error: "Invalid scheduledDate" }, 400);
      }
    }

    // --- Rejected (New Logic) ---
    if (status === "rejected") {
      if (!reason || reason.trim() === "") {
        return json(
          { success: false, error: "Reject reason is required" },
          400
        );
      }
      updateData.rejectReason = reason;
    }

    // --- Approved / Posted / Pending ---
    // (no special fields required)

    const updated = await Post.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!updated) {
      return json({ success: false, error: "Post not found" }, 404);
    }

    return json({ success: true, data: updated });

  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}

/**
 * DELETE -> Delete post by ID
 * Query: ?id=POST_ID&userId=MB-02
 */
export async function DELETE(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return json({ success: false, error: "id & userId required" }, 400);
    }

    // ✅ Set status to rejected instead of deleting
    const updatedPost = await Post.findOneAndUpdate(
      { _id: id, userId },
      { status: "rejected" },
      { new: true }
    );

    if (!updatedPost) {
      return json({ success: false, error: "Post not found" }, 404);
    }

    return json({ 
      success: true, 
      message: "Post rejected successfully",
      post: updatedPost 
    });

  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}
