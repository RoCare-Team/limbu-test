"use client";
import { useEffect, useState } from "react";

export default function LeadsAdminPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/contact-form", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setLeads(data.data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        📋 Contact Leads
      </h1>

      {loading ? (
        <p className="text-center text-lg font-medium text-gray-600">
          Loading leads...
        </p>
      ) : leads.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No leads found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left text-sm">
                <th className="py-3 px-4 border-b">Name</th>
                <th className="py-3 px-4 border-b">Email</th>
                <th className="py-3 px-4 border-b">Phone</th>
                <th className="py-3 px-4 border-b">Message</th>
                <th className="py-3 px-4 border-b">Date</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="text-sm text-gray-800 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 border-b">{lead.name}</td>
                  <td className="py-3 px-4 border-b">{lead.email}</td>
                  <td className="py-3 px-4 border-b">{lead.phone}</td>
                  <td className="py-3 px-4 border-b">{lead.message}</td>
                  <td className="py-3 px-4 border-b">
                    {new Date(lead.createdAt).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
