import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState(""); // store generated link
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate reset link (developer view)
  const handleGenerateLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/forgot-password", {
        email,
        generateOnly: true,
      });
      console.log("Forgot password response:", response.data);

      if (response.data.resetURL) {
        setResetLink(response.data.resetURL);
        // setSuccess("RESET_LINK::" + response.data.resetURL);
        setSuccess("Password reset link generated successfully.");
        // alert(`Generated Reset Link:\n${response.data.resetURL}`); // popup for developer
      } else {
        setSuccess("Password reset link generated (no direct URL provided).");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to generate reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Send email with the already generated link
  const handleSendEmail = async () => {
    if (!email) {
      setError("Please enter an email address first.");
      return;
    }
    if (!resetLink) {
      setError("Please generate a reset link first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/send-reset-email", {
        email,
        resetLink, // send generated link to backend
      });
      setSuccess(response.data.message || "Email sent successfully!");
    } catch (err) {
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
            Enter your email address and generate a reset link or send it via
            email.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-blue-50 border border-blue-400 text-blue-700 px-4 py-4 rounded shadow-md break-words overflow-hidden">
            <p>{success}</p>
            {resetLink && (
              <a
                href={resetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline font-semibold"
              >
                Click here to reset your password
              </a>
            )}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleGenerateLink}>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-4">
            {/* Generate Link */}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded"
            >
              {loading ? "Generating..." : "Generate Reset Link"}
            </button>

            {/* Send Email */}
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={loading || !email}
              className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded"
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-indigo-600">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
