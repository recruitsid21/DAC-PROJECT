import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[rgba(8,12,25,1)] text-white pt-8 pb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/3 lg:w-1/4 px-4 mb-8">
            <h3 className="text-xl font-semibold mb-4">Evenza</h3>
            <p className="text-gray-400">
              Your one-stop platform for discovering and booking amazing events.
            </p>
          </div>

          <div className="w-full md:w-1/3 lg:w-1/4 px-4 mb-8">
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul>
              <li className="mb-2">
                <Link
                  to="/events"
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  Browse Events
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  Login
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/register"
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div className="w-full md:w-1/3 lg:w-1/4 px-4 mb-8">
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul>
              <li className="mb-2">
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  Contact
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="w-full md:w-1/3 lg:w-1/4 px-4 mb-8">
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition duration-300"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Evenza. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
