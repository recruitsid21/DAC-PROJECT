// client/src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6 text-indigo-700">
        Welcome to the Event Booking Platform
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        Discover amazing events and book your tickets with ease!
      </p>
      <div className="space-y-4">
        <Link
          to="/events"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-md transition duration-300 shadow-md"
        >
          Browse All Events
        </Link>
        <Link
          to="/login"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-md transition duration-300 shadow-md"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-md transition duration-300 shadow-md"
        >
          Sign Up
        </Link>
        {/* Add more links for logged-in users or different roles later */}
      </div>
    </div>
  );
}

export default HomePage;
