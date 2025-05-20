import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import api from "../../services/api";

export default function MyBookings() {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/bookings");
      setUpcomingBookings(response.data.data.upcomingBookings || []);
      setPastBookings(response.data.data.pastBookings || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const renderBookingCard = (booking) => {
    const eventDate = new Date(`${booking.event.date} ${booking.event.time}`);
    const formattedDate = format(eventDate, "EEE, MMM d, yyyy");
    const formattedTime = format(eventDate, "h:mm a");

    return (
      <div
        key={booking.booking_id}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start">
              <div className="relative h-20 w-20 mr-4">
                <img
                  src={
                    booking.event.image_url || "/images/event-placeholder.jpg"
                  }
                  alt={booking.event.title}
                  className="absolute inset-0 w-full h-full object-cover rounded"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {booking.event.title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {formattedDate} at {formattedTime}
                </p>
                <p className="text-gray-600">{booking.event.location}</p>
                <p className="text-gray-600 mt-2">
                  Seats:{" "}
                  {booking.seats.map((seat) => seat.seat_number).join(", ")}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              ₹{booking.total_amount}
            </p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </span>
            </div>
            {booking.is_upcoming && booking.status === "confirmed" && (
              <button
                onClick={() => handleCancelBooking(booking.booking_id)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>

      {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">You haven't made any bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcomingBookings.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Upcoming Events
              </h2>
              <div className="space-y-4">
                {upcomingBookings.map(renderBookingCard)}
              </div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Past Events
              </h2>
              <div className="space-y-4">
                {pastBookings.map(renderBookingCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
