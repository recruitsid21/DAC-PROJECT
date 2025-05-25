import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const getDisplayName = (user) => {
    if (!user || !user.name) return "User";
    return user.name.split(" ")[0];
  };

  return (
    <nav className="bg-gray-900 shadow-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <Link to="/" className="flex items-center py-4 px-2">
              <span className="font-semibold text-white text-xl hover:text-indigo-400 transition duration-300">
                Evenza
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/events"
              className="py-4 px-2 text-gray-300 font-medium hover:text-indigo-400 transition duration-300"
            >
              Events
            </Link>

            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="py-4 px-2 text-gray-300 font-medium hover:text-indigo-400 transition duration-300"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user.role === "organizer" && (
                  <Link
                    to="/creator/dashboard"
                    className="py-4 px-2 text-gray-300 font-medium hover:text-indigo-400 transition duration-300"
                  >
                    Creator Dashboard
                  </Link>
                )}
                <Link
                  to={
                    user.role === "organizer"
                      ? "/creator/events"
                      : user.role === "admin"
                      ? "/admin/events"
                      : "/user/bookings"
                  }
                  className="py-4 px-2 text-gray-300 font-medium hover:text-indigo-400 transition duration-300"
                >
                  {user.role === "organizer"
                    ? "My Events"
                    : user.role === "admin"
                    ? "All Events"
                    : "My Bookings"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-indigo-500/30"
                >
                  Logout
                </button>
                <Link
                  to={
                    user.role === "admin"
                      ? "/admin/dashboard"
                      : user.role === "organizer"
                      ? "/creator/dashboard"
                      : "/user/dashboard"
                  }
                  className="py-4 px-2 text-indigo-400 hover:text-indigo-300 transition duration-300 font-medium"
                >
                  Hi, {getDisplayName(user)}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-2 px-3 text-gray-300 font-medium hover:text-indigo-400 transition duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-indigo-500/30"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
