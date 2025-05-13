import { useAuth } from "../../context/useAuth";

export default function CreatorDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Creator Dashboard
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}</h2>
        <p className="text-gray-600">
          Manage your events and view insights about your bookings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-medium text-indigo-800">Total Events</h3>
            <p className="text-2xl font-bold mt-2">12</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">Total Bookings</h3>
            <p className="text-2xl font-bold mt-2">156</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-800">Revenue</h3>
            <p className="text-2xl font-bold mt-2">₹24,500</p>
          </div>
        </div>
      </div>
    </div>
  );
}
