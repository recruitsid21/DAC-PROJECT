import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function EventCard({ event }) {
  // Check if event is undefined and provide default values or handle errors
  if (!event) {
    return <div>Error: Event data is not available</div>;
  }

  // Initialize date properly
  const eventDateTime = new Date(event.date);

  // Check if the event date is valid
  if (isNaN(eventDateTime)) {
    console.error("Invalid date format");
    return <div>Error: Invalid event data</div>;
  }

  // Format the date into a readable format
  const formattedDate = format(eventDateTime, "MMM d, yyyy h:mm a");

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative pb-48 overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={event.image_url || "/images/event-placeholder.jpg"}
          alt={event.title}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-indigo-600">
            {event.category_name || "General"}
          </span>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {event.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.short_description || event.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ₹{parseFloat(event.price).toFixed(2)}
          </span>
          <Link
            to={`/events/${event.event_id}`}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
