import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Events from "./pages/Events";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CartPage from "./pages/CartPage";
import MyRegistrations from "./pages/MyRegistrations";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    const role = localStorage.getItem("role");
    if (token && userName) {
      setUser({ name: userName, role, token });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <header className="amz-header">
        <Link to="/" className="amz-logo">
          TechFest<span>.in</span>
        </Link>
        <nav className="amz-nav-links">
          <Link to="/">Events</Link>
          {user ? (
            <>
              <span style={{ color: "#febd69", fontWeight: "bold" }}>
                Hello, {user.name}
              </span>
              <Link to="/cart">Cart 🛒</Link>
              <Link to="/my">My Registrations 📦</Link>
              <button
                onClick={handleLogout}
                className="amz-btn-secondary"
                style={{ width: "auto", padding: "4px 12px" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signup">Sign Up</Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </nav>
      </header>

      <div className="amz-subnav">
        <span>All Technical Events</span>
        <span>Hackathons</span>
        <span>Workshops</span>
      </div>

      <main className="amz-container">
        <Routes>
          <Route path="/" element={<Events user={user} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/cart" element={<CartPage user={user} />} />
          <Route path="/my" element={<MyRegistrations user={user} />} />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;