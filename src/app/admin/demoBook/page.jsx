"use client";
import { useEffect, useState } from "react";

export default function DemoBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch API Data
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookDemo");
      const data = await res.json();

      if (data.success) {
        // Default status for UI
        const withStatus = data.data.map((item) => ({
          ...item,
          status: "Not Attend", // Default
        }));

        setBookings(withStatus);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Toggle Status: Not Attend → Attend → Not Attend
  const toggleStatus = (id) => {
    setBookings((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              status: item.status === "Attend" ? "Not Attend" : "Attend",
            }
          : item
      )
    );
  };

  if (loading) return <p className="text-center p-4">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Demo Booking List
      </h2>

      <div className="overflow-x-auto shadow-xl rounded-lg">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Seminar Time</th>
              <th className="p-3 border">Booked On</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((item, index) => (
              <tr key={item._id} className="text-center">
                <td className="p-3 border">{index + 1}</td>
                <td className="p-3 border">{item.name}</td>
                <td className="p-3 border">{item.phone}</td>
                <td className="p-3 border">{item.seminarTime}</td>
                <td className="p-3 border">
                  {new Date(item.createdAt).toLocaleString()}
                </td>

                <td className="p-3 border">
                  <button
                    onClick={() => toggleStatus(item._id)}
                    className={`px-4 py-1 rounded-md text-white font-semibold ${
                      item.status === "Attend"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {item.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
