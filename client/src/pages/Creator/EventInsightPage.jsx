import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";

export default function EventInsightPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await api.get(`/creator/events/${id}/insights`);
        setEvent(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch event insights"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Event Insights: {event.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Booking Statistics</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Total Seats: {event.total_seats}</p>
              <p className="text-gray-600">
                Booked Seats: {event.booked_seats}
              </p>
              <p className="text-gray-600">
                Available Seats: {event.available_seats}
              </p>
            </div>
            <div className="h-4 bg-gray-200 rounded-full">
              <div
                className="h-4 bg-indigo-600 rounded-full"
                style={{
                  width: `${(event.booked_seats / event.total_seats) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue</h2>
          <p className="text-2xl font-bold text-green-600">
            ₹{event.total_revenue?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>
    </div>
  );
}
