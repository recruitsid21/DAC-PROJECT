import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPrompt({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 transform animate-slide-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please log in to view event details and book tickets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 ease-in-out"
            >
              Log In
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 ease-in-out"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
