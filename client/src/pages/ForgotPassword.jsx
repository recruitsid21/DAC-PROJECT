import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      console.log("Forgot password response:", response.data);

      if (response.data.resetURL) {
        setSuccess("RESET_LINK::" + response.data.resetURL);
      }
      // if (response.data.resetURL) {
      //   // For development, show the reset URL
      //   setSuccess(
      //     `Password reset link has been generated. For development, you can use this link: ${response.data.resetURL}`
      //   );
      else {
        setSuccess("Password reset link has been sent to your email address.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div
            className="bg-blue-50 border border-blue-400 text-blue-700 px-4 py-4 rounded shadow-md"
            role="alert"
          >
            <p className="font-semibold mb-1">Reset link generated:</p>
            {success.startsWith("RESET_LINK::") ? (
              <a
                href={success.replace("RESET_LINK::", "")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline"
              >
                Click here to reset your password
              </a>
            ) : (
              <span>{success}</span>
            )}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending..." : "Generate Reset Link"}
            </button>

            {/* Enable for later implementation */}
            {/* <button
              type="button"
              onClick={() => {
                // TODO: Implement email sending functionality
                alert("Email functionality will be implemented later!");
              }}
              className="flex-1 group relative flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Send Email Later
            </button> */}
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
