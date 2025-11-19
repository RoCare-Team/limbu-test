"use client";

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-10 px-6 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
          Cancellation & Refund Policy
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Effective Date: 31 October 2025
        </p>

        {/* OVERVIEW */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            1. Overview
          </h2>
          <p>
            This Cancellation & Refund Policy outlines the terms applicable to
            users (“you”, “your”) who make payments for services offered on{" "}
            <strong>Limbo AI</strong> (“we”, “our”, “us”). All transactions are
            processed securely through <strong>Razorpay</strong>.
          </p>
        </section>

        {/* SERVICE ACTIVATION */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            2. Service Activation
          </h2>
          <p>
            Once a payment is successfully made and the subscription/service is
            activated, the service is considered delivered. Due to the digital
            nature of our SaaS platform, cancellations or refunds are generally
            not applicable once services have been initiated.
          </p>
        </section>

        {/* CANCELLATION POLICY */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            3. Cancellation Policy
          </h2>
          <p>
            You may cancel your subscription plan at any time by contacting our
            support team before the next billing cycle begins. However, no
            refunds will be provided for the current active billing period or
            partially used subscription terms.
          </p>
        </section>

        {/* REFUND POLICY */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            4. Refund Policy
          </h2>
          <p>
            All payments made towards service activation are{" "}
            <strong>non-refundable</strong>. Refunds will only be issued in the
            following exceptional circumstances:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2">
            <li>Duplicate payment was made due to a technical issue.</li>
            <li>Incorrect amount was charged due to a billing error.</li>
            <li>
              Payment was deducted but the service was not activated within 24
              hours.
            </li>
          </ul>
          <p className="mt-3">
            In such cases, users must raise a refund request within{" "}
            <strong>7 working days</strong> from the date of payment by emailing
            us at{" "}
            <a
              href="mailto: info@limbu.ai"
              className="text-blue-600 underline"
            >
               info@limbu.ai
            </a>
            .
          </p>
        </section>

        {/* REFUND PROCESSING */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            5. Refund Processing
          </h2>
          <p>
            Approved refunds will be processed within{" "}
            <strong>7–10 business days</strong> from the date of confirmation.
            Refunds will be credited through the same payment method used during
            the original transaction, subject to Razorpay’s processing timelines.
          </p>
        </section>

        {/* NO CASH REFUND */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            6. No Cash Refunds
          </h2>
          <p>
            All approved refunds will be made electronically. We do not offer
            cash or manual refunds under any circumstances.
          </p>
        </section>

        {/* CONTACT DETAILS */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            7. Contact Us
          </h2>
          <p>
            For cancellation or refund-related queries, please contact our
            support team:
          </p>

          <div className="mt-3 space-y-1">
            <p>
              📧 <strong>Email:</strong>{" "}
              <a
                href="mailto: info@limbu.ai"
                className="text-blue-600 underline"
              >
                 info@limbu.ai
              </a>
            </p>
            <p>
              📞 <strong>Phone:</strong> +91 9540384046
            </p>
            <p>
              🌐 <strong>Website:</strong>{" "}
              <a
                href="https://limbo.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                https://limbo.ai
              </a>
            </p>
          </div>
        </section>

        {/* CONSENT */}
        <section className="mt-8 border-t pt-4 text-sm text-gray-600">
          <p>
            By making payments through Razorpay and using our SaaS services, you
            agree to this Cancellation & Refund Policy.
          </p>
          <p className="mt-2 text-center text-gray-500">
            © {new Date().getFullYear()} Limbo AI. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  );
}
