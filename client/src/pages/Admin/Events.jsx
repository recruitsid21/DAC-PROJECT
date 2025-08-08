import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/admin/events");
      setEvents(response.data.data.events);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (eventId) => {
    try {
      await api.patch(`/admin/events/${eventId}/toggle-status`);
      toast.success("Event status updated successfully!");
      fetchEvents();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update event status";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This will delete all related bookings, seats, and other data."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/admin/events/${eventId}`);
      toast.success("Event deleted successfully!");
      fetchEvents(); // Refresh the events list
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete event";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Manage Events
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 md:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-3 md:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Organizer
              </th>
              <th className="px-3 md:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-3 md:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-3 md:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 md:px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.event_id} className="hover:bg-gray-50">
                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="h-8 w-8 md:h-10 md:w-10 rounded-full mr-2 md:mr-3 object-cover"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500">
                        {event.short_description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {event.organizer_name}
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {event.category_name}
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    {new Date(event.date).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {event.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right font-medium space-x-2 md:space-x-4">
                  <button
                    onClick={() => handleToggleStatus(event.event_id)}
                    className="text-yellow-600 hover:text-yellow-900 transition"
                  >
                    {event.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <a
                    href={`/events/${event.event_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-900 transition"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(event.event_id)}
                    className="text-red-600 hover:text-red-900 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
