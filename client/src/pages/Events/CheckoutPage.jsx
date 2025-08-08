import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId, selectedSeats } = location.state || {};
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Debug: log eventId and selectedSeats at the start
  console.log("CheckoutPage loaded with:", { eventId, selectedSeats });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching event data for eventId:", eventId);
        console.log("Calling:", `/events/${eventId}`);
        // Fetch event details
        const eventRes = await api.get(`/events/${eventId}`);
        console.log("Event response:", eventRes.data);
        setEvent(eventRes.data.data.event);

        // Fetch all seats for the event
        console.log("Fetching seats for eventId:", eventId);
        console.log("Calling:", `/events/${eventId}/seats`);
        const seatsRes = await api.get(`/events/${eventId}/seats`);
        console.log("Seats response:", seatsRes.data);
        setSeats(seatsRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        console.error("Error response:", error.response);
        setError("Failed to load event or seats");
      } finally {
        setLoading(false);
      }
    };
    if (eventId && selectedSeats && selectedSeats.length > 0) {
      fetchData();
    } else {
      console.log("Missing data:", { eventId, selectedSeats });
      setError("No event or seats selected.");
      setLoading(false);
    }
  }, [eventId, selectedSeats]);

  const handleConfirmBooking = async () => {
    try {
      setConfirming(true);
      setError("");

      // Calculate total amount
      const totalAmount = selectedSeats.reduce((total, seatId) => {
        const seat = seats.find((s) => s.seat_id === seatId);
        return total + (seat ? parseFloat(seat.final_price) : 0);
      }, 0);

      // Create booking
      await api.post("/bookings", {
        event_id: eventId,
        seat_ids: selectedSeats,
        total_amount: totalAmount,
      });

      toast.success("Booking confirmed successfully!");
      navigate("/user/bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm booking");
      toast.error("Failed to confirm booking. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <ErrorMessage message="Event not found" />;

  const eventDateTime = new Date(`${event.date}T${event.time}`);
  const formattedDate = isNaN(eventDateTime)
    ? "Invalid date"
    : format(eventDateTime, "EEEE, MMMM d, yyyy h:mm a");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Booking Summary
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">{event.title}</h3>
              <p className="text-gray-600">{formattedDate}</p>
              <p className="text-gray-600">{event.location}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Selected Seats</h3>
              <div className="bg-gray-50 rounded-md p-4">
                {selectedSeats.map((seatId) => {
                  const seat = seats.find((s) => s.seat_id === seatId);
                  return seat ? (
                    <div
                      key={seat.seat_id}
                      className="flex justify-between items-center mb-2 last:mb-0"
                    >
                      <span className="text-gray-700">
                        Seat {seat.seat_number} ({seat.seat_type})
                      </span>
                      <span className="font-medium">
                        ₹{parseFloat(seat.final_price).toFixed(2)}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span>
                  ₹
                  {selectedSeats
                    .reduce((total, seatId) => {
                      const seat = seats.find((s) => s.seat_id === seatId);
                      return total + (seat ? parseFloat(seat.final_price) : 0);
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleConfirmBooking}
            disabled={confirming}
            className={`px-6 py-3 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              confirming ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {confirming ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
