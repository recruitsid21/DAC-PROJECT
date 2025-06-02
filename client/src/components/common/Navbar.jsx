import { Link, useNavigate } from "react-router-dom";
import EvenzaLogo from "../../../public/EvenzaLogo4crop.png"; // ✅ Your logo image

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // ✅ Prevent ESLint "no-unused-vars" error for unused function
  const _handleLogout = () => {
    onLogout(); // Or add logic here if needed in future
    navigate("/");
  };

  const getDisplayName = (user) => {
    if (!user || !user.name) return "User";
    return user.name.split(" ")[0];
  };

  return (
    <nav className="bg-[rgba(8,12,25,1)] shadow-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={EvenzaLogo} alt="Evenza Logo" className="h-12 w-auto" />
          </Link>

          {/* Nav links */}
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
