import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function EventInsightPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFrame, setTimeFrame] = useState("all"); // all, week, month
  const [bookingHistory, setBookingHistory] = useState([]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const eventResponse = await api.get(`/creator/events/${id}/insights`);
        if (!eventResponse.data.data) {
          throw new Error("Invalid event data received");
        }

        const { event: eventData, insights } = eventResponse.data.data;
        setEvent({
          ...eventData,
          total_seats: Number(eventData.total_seats || 0),
          booked_seats: Number(
            eventData.total_seats - eventData.available_seats || 0
          ),
          available_seats: Number(eventData.available_seats || 0),
          total_revenue: Number(insights?.revenue?.total || 0),
          average_rating: Number(eventData.average_rating || 0),
          total_reviews: Number(eventData.total_reviews || 0),
          booking_rate: Number(insights?.bookings?.booking_rate || 0),
          confirmed_bookings: Number(insights?.bookings?.confirmed || 0),
          cancelled_bookings: Number(insights?.bookings?.cancelled || 0),
          unique_customers: Number(insights?.revenue?.unique_customers || 0),
          average_per_booking: Number(
            insights?.revenue?.average_per_booking || 0
          ),
          seat_distribution: insights?.seats?.distribution || {},
        });
        if (eventResponse.data.data.insights?.recent_bookings) {
          setBookingHistory(eventResponse.data.data.insights.recent_bookings);
        }
      } catch (err) {
        console.error("Error fetching event insights:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch event insights"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const calculateBookingStats = () => {
    if (!bookingHistory.length) return null;

    const now = new Date();
    const filteredBookings = bookingHistory.filter((booking) => {
      const bookingDate = new Date(booking.created_at);
      if (timeFrame === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return bookingDate >= weekAgo;
      } else if (timeFrame === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return bookingDate >= monthAgo;
      }
      return true;
    });

    const totalBookings = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce(
      (sum, booking) => sum + Number(booking.total_amount),
      0
    );

    return { totalBookings, totalRevenue };
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <ErrorMessage message="Event not found" />;

  const bookingStats = calculateBookingStats();
  const occupancyRate = (event.booked_seats / event.total_seats) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Event Insights: {event.title}
          </h1>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              ₹
              {event.total_revenue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
            {bookingStats && timeFrame !== "all" && (
              <p className="text-sm text-indigo-700 mt-2">
                ₹
                {bookingStats.totalRevenue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}{" "}
                in selected period
              </p>
            )}
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Occupancy Rate
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {occupancyRate.toFixed(1)}%
            </p>
            <p className="text-sm text-green-700 mt-2">
              {event.booked_seats} of {event.total_seats} seats booked
            </p>
          </div>{" "}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Booking Rate
            </h3>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-purple-600">
                {event.booking_rate.toFixed(1)}%
              </p>
              <p className="text-sm text-purple-700 ml-2">
                ({event.confirmed_bookings} confirmed)
              </p>
            </div>
            <p className="text-sm text-purple-600 mt-2">
              {event.cancelled_bookings} cancelled bookings
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Customer Insights
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {event.unique_customers}
            </p>
            <p className="text-sm text-yellow-700 mt-2">Unique customers</p>
            <p className="text-sm text-yellow-600 mt-1">
              Avg. ₹
              {event.average_per_booking.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}{" "}
              per booking
            </p>
          </div>
        </div>

        {/* Seat Distribution */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Seat Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(event.seat_distribution).map(([type, stats]) => (
              <div key={type} className="bg-white rounded-lg border p-4">
                <h3 className="font-medium text-gray-900 capitalize mb-2">
                  {type} Seats
                </h3>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total: {stats.total}</span>
                  <span>Booked: {stats.booked}</span>
                  <span>Available: {stats.available}</span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-indigo-600 rounded"
                    style={{ width: `${(stats.booked / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seat Availability Visualization */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Seat Availability
          </h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                  Booking Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-indigo-600">
                  {occupancyRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
              <div
                style={{ width: `${occupancyRate}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>Booked Seats: {event.booked_seats}</div>
              <div>Available Seats: {event.available_seats}</div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Event Details
            </h2>
            <div className="space-y-3">
              <p className="text-gray-600">
                <span className="font-medium">Date: </span>
                {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Time: </span>
                {event.time}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Location: </span>
                {event.location}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Category: </span>
                {event.category_name || "General"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Price: </span>₹
                {Number(event.price).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Recent Bookings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Bookings
            </h2>
            <div className="space-y-4">
              {" "}
              {bookingHistory.slice(0, 5).map((booking) => (
                <div
                  key={booking.booking_id}
                  className="flex justify-between items-center border-b border-gray-200 pb-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        Booking #{booking.booking_id}
                      </p>
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                        {booking.user_name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(
                        new Date(booking.created_at),
                        "MMM d, yyyy h:mm a"
                      )}
                    </p>
                    {booking.booked_seats && (
                      <p className="text-xs text-gray-500 mt-1">
                        Seats: {booking.booked_seats}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      ₹
                      {Number(booking.total_amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.user_email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
