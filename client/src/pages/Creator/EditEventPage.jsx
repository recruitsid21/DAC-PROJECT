import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    location: "",
    venue_details: "",
    date: "",
    time: "",
    end_date: "",
    end_time: "",
    category_id: "",
    price: 0,
    total_seats: 0,
    capacity: 0,
    image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      // Handle cases where timeString might already be in HH:mm format
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString;
      }
      const date = new Date(`2000-01-01T${timeString}`);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (err) {
      console.error("Time format error:", err);
      return "";
    }
  };

  useEffect(() => {
    const fetchEventAndCategories = async () => {
      try {
        setLoading(true);
        const [eventRes, categoriesRes] = await Promise.all([
          api.get(`/events/${id}`), // Changed from /creator/events to /events
          api.get("/categories"),
        ]);

        const event = eventRes.data.data.event;
        setFormData({
          title: event.title || "",
          description: event.description || "",
          short_description: event.short_description || "",
          location: event.location || "",
          venue_details: event.venue_details || "",
          date: event.date ? event.date.split("T")[0] : "",
          time: formatTime(event.time),
          end_date: event.end_date ? event.end_date.split("T")[0] : "",
          end_time: formatTime(event.end_time),
          category_id: event.category_id?.toString() || "",
          price: parseFloat(event.price) || 0,
          total_seats: parseInt(event.total_seats) || 0,
          capacity: parseInt(event.capacity) || 0,
          image_url: event.image_url || "",
        });

        setCategories(categoriesRes.data.data.categories);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(
          err.response?.data?.message || "Failed to fetch event details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndCategories();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const eventData = {
        ...formData,
        end_date: formData.end_date || null,
        end_time: formData.end_time ? formatTime(formData.end_time) : null,
        time: formatTime(formData.time),
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        total_seats: parseInt(formData.total_seats),
        capacity: parseInt(formData.total_seats), // Set capacity equal to total_seats
      };

      await api.put(`/events/${id}`, eventData); // Changed from /creator/events to /events
      toast.success("Event updated successfully!");
      navigate(`/creator/events/${id}`);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update event");
      toast.error(err.response?.data?.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Event</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Time */}
          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Time *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* End Time */}
          <div>
            <label
              htmlFor="end_time"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Time
            </label>
            <input
              type="time"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price (₹) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Total Seats */}
          <div>
            <label
              htmlFor="total_seats"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Total Seats *
              <span className="ml-1 text-xs text-gray-500">
                (Cannot be modified after creation)
              </span>
            </label>
            <input
              type="number"
              id="total_seats"
              name="total_seats"
              value={formData.total_seats}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              title="Total seats cannot be modified after event creation"
            />
          </div>

          {/* Image URL */}
          <div>
            <label
              htmlFor="image_url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image URL
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Short Description */}
        <div className="mb-6">
          <label
            htmlFor="short_description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Short Description
          </label>
          <input
            type="text"
            id="short_description"
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Venue Details */}
        <div className="mb-6">
          <label
            htmlFor="venue_details"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Venue Details
          </label>
          <textarea
            id="venue_details"
            name="venue_details"
            value={formData.venue_details}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/creator/events/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Update Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
