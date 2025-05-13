import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const [bookingResponse, paymentResponse] = await Promise.all([
          api.get(`/bookings/${bookingId}`),
          api.get(`/payments?booking_id=${bookingId}`),
        ]);

        setBooking(bookingResponse.data);
        setPayment(paymentResponse.data.payments[0] || null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch booking details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  const handlePayment = async () => {
    setProcessingPayment(true);
    setError("");

    try {
      // In a real app, this would integrate with a payment gateway
      const paymentResponse = await api.post("/payments/initiate", {
        booking_id: bookingId,
        payment_method: "razorpay",
      });

      // Mock payment verification - in reality this would be handled by the payment gateway callback
      await api.post("/payments/verify", {
        payment_id: paymentResponse.data.payment_id,
        transaction_id: paymentResponse.data.transaction_id,
      });

      navigate(`/bookings/${bookingId}?payment=success`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Payment failed. Please try again."
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Complete Your Booking
          </h1>

          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Booking Summary
            </h2>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Event:</span>
              <span className="font-medium">{booking.event_title}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">
                {new Date(`${booking.date} ${booking.time}`).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{booking.location}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Seats:</span>
              <span className="font-medium">
                {booking.seats.map((seat) => seat.seat_number).join(", ")}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
              <span>Total Amount:</span>
              <span>₹{booking.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {payment ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {payment.payment_status === "captured"
                      ? "Your payment was successful and your booking is confirmed!"
                      : `Payment status: ${payment.payment_status}`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <button className="border rounded-md p-4 flex items-center justify-center hover:border-indigo-500">
                  <img
                    src="/images/razorpay-logo.png"
                    alt="Razorpay"
                    className="h-8"
                  />
                </button>
                <button className="border rounded-md p-4 flex items-center justify-center hover:border-indigo-500">
                  <img
                    src="/images/stripe-logo.png"
                    alt="Stripe"
                    className="h-8"
                  />
                </button>
                <button className="border rounded-md p-4 flex items-center justify-center hover:border-indigo-500">
                  <img
                    src="/images/paypal-logo.png"
                    alt="PayPal"
                    className="h-8"
                  />
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₹{booking.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax:</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>₹{booking.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Events
            </button>

            {!payment && (
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  processingPayment ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {processingPayment ? "Processing..." : "Pay Now"}
              </button>
            )}

            {payment && (
              <button
                onClick={() => navigate(`/bookings/${bookingId}`)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Booking Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
