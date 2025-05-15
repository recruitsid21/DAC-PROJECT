import { useAuth } from "../../context/useAuth";

export default function UserDashboard() {
  const { user } = useAuth();
  console.log("user:", user);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Dashboard</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Welcome back, {user?.name}
        </h2>
        <p className="text-gray-600 mb-6">
          Here's what's happening with your event bookings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">Upcoming Events</h3>
            <p className="text-2xl font-bold mt-2">3</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">Total Bookings</h3>
            <p className="text-2xl font-bold mt-2">12</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-800">Wishlist</h3>
            <p className="text-2xl font-bold mt-2">5</p>
          </div>
        </div>
      </div>
    </div>
  );
}
