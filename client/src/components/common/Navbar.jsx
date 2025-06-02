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
        <div className="flex justify-between items-center py-2">
          {/* Left: Evenza + Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <span className="font-semibold text-white text-xl transition duration-300 group-hover:text-indigo-400 border-b-2 border-transparent group-hover:border-indigo-400">
              Evenza
            </span>
            <img
              src="EvenzaLogo.png"
              alt="Logo"
              className="w-10 h-10 rounded-full border-2 border-indigo-500 transition duration-300 group-hover:border-indigo-300"
            />
          </Link>

          {/* Right: Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/events"
              className="py-2 px-3 text-gray-300 font-medium border-b-2 border-transparent hover:border-indigo-400 hover:text-indigo-400 transition duration-300"
            >
              Events
            </Link>

            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="py-2 px-3 text-gray-300 font-medium border-b-2 border-transparent hover:border-indigo-400 hover:text-indigo-400 transition duration-300"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user.role === "organizer" && (
                  <Link
                    to="/creator/dashboard"
                    className="py-2 px-3 text-gray-300 font-medium border-b-2 border-transparent hover:border-indigo-400 hover:text-indigo-400 transition duration-300"
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
                  className="py-2 px-3 text-gray-300 font-medium border-b-2 border-transparent hover:border-indigo-400 hover:text-indigo-400 transition duration-300"
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
                  className="py-2 px-3 text-indigo-400 font-medium border-b-2 border-transparent hover:border-indigo-300 hover:text-indigo-300 transition duration-300"
                >
                  Hi, {getDisplayName(user)}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-2 px-3 text-gray-300 font-medium border-b-2 border-transparent hover:border-indigo-400 hover:text-indigo-400 transition duration-300"
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
