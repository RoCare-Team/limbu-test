"use client";

import { useEffect, useState } from "react";

export default function DemoPage() {
  const [bookings, setBookings] = useState([]);

  // ---------------------------
  // FETCH ALL BOOKINGS
  // ---------------------------
  const loadBookings = async () => {
    const res = await fetch("/api/bookDemo");
    const data = await res.json();
    setBookings(data.data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ---------------------------
  // UPDATE STATUS
  // ---------------------------
  const updateStatus = async (id, status) => {
    await fetch("/api/bookDemo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    loadBookings();
  };

  // ---------------------------
  // DELETE BOOKING
  // ---------------------------
  const deleteBooking = async (id) => {
    await fetch("/api/bookDemo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadBookings();
  };

  // ---------------------------
  // TABLE UI
  // ---------------------------
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Demo Bookings</h1>

      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="w-full table-auto text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Seminar Time</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b, i) => (
              <tr key={b._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{b.name}</td>
                <td className="p-3">{b.phone}</td>
                <td className="p-3">{b.seminarTime}</td>
                <td className="p-3">{b.selectedDate}</td>

                {/* Status Badge */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-lg text-white text-sm ${
                      b.status === "Attended"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>

                {/* Action Buttons */}
                <td className="p-3">
                  <div className="flex gap-2">

                    {/* Show only when NOT ATTENDED */}
                    {b.status === "Not Attended" && (
                      <>
                        <button
                          onClick={() => updateStatus(b._id, "Attended")}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Mark Attended
                        </button>

                        <button
                          onClick={() => updateStatus(b._id, "Not Attended")}
                          className="bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                          Not Attended
                        </button>
                      </>
                    )}

                    {/* Delete Button (Always Show) */}
                    <button
                      onClick={() => deleteBooking(b._id)}
                      className="bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
