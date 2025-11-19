"use client";

import { HiPhone, HiMail, HiLocationMarker, HiClock } from "react-icons/hi";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-3xl border border-gray-200">
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">
          Contact Us
        </h1>

        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Have any questions or need support? Our team is always here to help you.
        </p>

        {/* Contact Details */}
        <div className="grid sm:grid-cols-2 gap-8 text-center">

          {/* Phone */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex justify-center mb-2">
              <HiPhone className="text-blue-600 text-3xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Phone</h2>
            <p className="text-gray-600 font-medium mt-1">+91 9540384046</p>
          </div>

          {/* Email */}
          <div className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex justify-center mb-2">
              <HiMail className="text-blue-600 text-3xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Email</h2>
            <p className="text-gray-600 font-medium mt-1">info@limbu.ai</p>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-50 rounded-xl p-6 mt-8 shadow-md hover:shadow-lg transition-all text-center">
          <div className="flex justify-center mb-2">
            <HiLocationMarker className="text-blue-600 text-3xl" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Address</h2>
          <p className="text-gray-600 mt-1 leading-relaxed">
            Unit No. 831, 8th Floor, JMD Megapolis,<br />
            Sector 48, Gurugram, Haryana 122018
          </p>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-50 rounded-xl p-6 mt-8 shadow-md hover:shadow-lg transition-all text-center">
          <div className="flex justify-center mb-2">
            <HiClock className="text-blue-600 text-3xl" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Business Hours</h2>
          <p className="text-gray-600 mt-1">Mon – Sat: 9:00 AM – 7:00 PM</p>
          <p className="text-gray-600">Sunday: Closed</p>
        </div>

        {/* Email Button */}
        <div className="mt-10 text-center">
          <a
            href="mailto:info@limbu.ai"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Send us an Email
          </a>
        </div>

      </div>
    </div>
  );
}
