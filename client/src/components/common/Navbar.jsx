import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <nav className="bg-[rgba(8,12,25,1)] shadow-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          {/* Left: Logo only (rectangle image) */}
          <Link to="/" className="flex items-center">
            <img
              src="EvenzaLogo4crop.png"
              alt="Logo"
              className="w-30 h-12 transition duration-300"
            />
          </Link>

          {/* Hamburger Menu - Only shows on mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Right: Navigation Links (desktop) */}
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

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-2 mt-2">
            <Link
              to="/events"
              className="text-gray-300 hover:text-indigo-400 px-2"
            >
              Events
            </Link>

            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-300 hover:text-indigo-400 px-2"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user.role === "organizer" && (
                  <Link
                    to="/creator/dashboard"
                    className="text-gray-300 hover:text-indigo-400 px-2"
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
                  className="text-gray-300 hover:text-indigo-400 px-2"
                >
                  {user.role === "organizer"
                    ? "My Events"
                    : user.role === "admin"
                    ? "All Events"
                    : "My Bookings"}
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white font-medium rounded-lg py-1 px-3 mx-2 hover:bg-indigo-700 transition duration-300"
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
                  className="text-indigo-400 px-2"
                >
                  Hi, {getDisplayName(user)}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-indigo-400 px-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white font-medium rounded-lg py-1 px-3 mx-2 hover:bg-indigo-700 transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
