import React from "react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>

          <div className="prose prose-lg text-gray-500">
            <p className="mb-4">
              At Evenza, we take your privacy seriously. This is a placeholder
              privacy policy that outlines our basic commitment to protecting
              your personal information.
            </p>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Data Collection
                </h2>
                <p>
                  We collect only the necessary information required to provide
                  you with our event booking services. This includes basic
                  account information and transaction details.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Data Protection
                </h2>
                <p>
                  Your data is protected using industry-standard security
                  measures. We never share your personal information with third
                  parties without your explicit consent.
                </p>
              </div>

              <div className="mt-6 text-sm text-gray-400">
                <p>
                  Note: This is a placeholder privacy policy. A more detailed
                  version will be provided soon, covering all aspects of our
                  data handling practices, user rights, and compliance with
                  relevant privacy regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
