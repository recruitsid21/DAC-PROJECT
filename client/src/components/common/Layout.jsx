import { useAuth } from "../../context/useAuth";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={logout} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
