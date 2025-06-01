import React from "react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>

          <div className="space-y-6 text-gray-500">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Get in Touch
              </h2>
              <p className="mb-4">
                We're here to help! If you have any questions or concerns,
                please don't hesitate to reach out to us.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Contact Information
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a
                    href="mailto:support@evenza.com"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    support@evenza.com
                  </a>
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-500">
                    +91 1234567890
                  </a>
                </p>
                <p>
                  <span className="font-medium">Hours:</span> Monday - Friday,
                  9:00 AM - 6:00 PM EST
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
