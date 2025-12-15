"use client";

import { useEffect, useState } from "react";

export default function FranchiseList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        const res = await fetch("/api/franchise");
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "Failed to fetch");

        setData(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFranchises();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading franchise applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Franchise Applications
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Experience</th>
              <th className="p-3 text-left">Investment</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{item.name}</td>
                <td className="p-3">{item.email}</td>
                <td className="p-3">{item.phone}</td>
                <td className="p-3">{item.city}</td>
                <td className="p-3">{item.experience}</td>
                <td className="p-3">{item.investment}</td>
                <td className="p-3 text-sm text-gray-600">
                  {new Date(item.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <p className="text-center mt-6 text-gray-600 font-semibold">
            No franchise applications found
          </p>
        )}
      </div>
    </div>
  );
}
