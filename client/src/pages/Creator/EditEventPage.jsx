import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    image_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        const event = response.data;

        setFormData({
          title: event.title,
          description: event.description,
          short_description: event.short_description || "",
          location: event.location,
          venue_details: event.venue_details || "",
          date: event.date,
          time: event.time,
          end_date: event.end_date || "",
          end_time: event.end_time || "",
          category_id: event.category_id || "",
          price: event.price,
          image_url: event.image_url || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.put(`/events/${id}`, formData);
      navigate(`/creator/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update event");
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
        {/* Add form fields here similar to CreateEventPage */}
        {/* Example field: */}
        <div className="mb-6">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Add other fields similarly */}

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
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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
