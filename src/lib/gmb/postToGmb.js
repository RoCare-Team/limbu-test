export async function postToGmbAction(payload) {
    const response = await fetch(
        "https://n8n.srv968758.hstgr.cloud/webhook/cc144420-81ab-43e6-8995-9367e92363b0",
        {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
        }
    );
    // Handle non-json responses from webhook
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return { ok: response.ok, data: await response.json() };
    } else {
        return { ok: response.ok, data: await response.text() };
    }
}