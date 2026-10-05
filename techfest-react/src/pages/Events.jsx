import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Events({ user }) {
  const [events, setEvents] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load events list
  function loadEvents() {
    axios
      .get(API + "/events")
      .then((res) => setEvents(res.data))
      .catch(() => setError("Could not load events"));
  }

  // Load current user's cart to map ticket quantities per event
  function loadCart() {
    const token = user?.token || localStorage.getItem("token");
    if (!token) {
      setCartItems({});
      return;
    }

    const config = { headers: { Authorization: "Bearer " + token } };
    axios
      .get(API + "/cart", config)
      .then((res) => {
        const itemMap = {};
        if (res.data && res.data.items) {
          res.data.items.forEach((item) => {
            if (item.eventId) {
              const id = typeof item.eventId === "object" ? item.eventId._id : item.eventId;
              itemMap[id] = item.quantity;
            }
          });
        }
        setCartItems(itemMap);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadEvents();
    loadCart();
  }, [user]);

  // Initial Add to Cart
  async function addToCart(eventId) {
    const token = user?.token || localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const config = { headers: { Authorization: "Bearer " + token } };
    try {
      await axios.post(API + "/cart/add", { eventId }, config);
      setMessage("Item added to cart!");
      setError("");
      loadCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item to cart");
    }
  }

  // Increment / Decrement from Events Page
  async function updateQuantity(eventId, action) {
    const token = user?.token || localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const config = { headers: { Authorization: "Bearer " + token } };
    try {
      await axios.post(API + "/cart/update", { eventId, action }, config);
      setError("");
      loadCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quantity");
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: "15px", fontWeight: "400" }}>
        Featured Events & Competitions
      </h2>

      {error && <p style={{ color: "#b12704", fontWeight: "bold", marginBottom: "10px" }}>{error}</p>}
      {message && <p style={{ color: "#007600", fontWeight: "bold", marginBottom: "10px" }}>{message}</p>}

      <div className="amz-grid">
        {events.map((ev) => {
          const isSoldOut = ev.seats <= 0;
          const qtyInCart = cartItems[ev._id] || 0;

          return (
            <div className="amz-card" key={ev._id}>
              <div>
                <span className="amz-badge">{ev.category || "Technical"}</span>
                <h3 className="amz-card-title">{ev.name}</h3>
                <p style={{ fontSize: "0.85rem", color: "#565959", marginBottom: "8px" }}>
                  Date: {new Date(ev.date).toDateString()}
                </p>
                <div className="amz-price">
                  <span>₹</span>{ev.fee}
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: isSoldOut ? "#b12704" : "#007600",
                    marginBottom: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {isSoldOut ? "SOLD OUT" : `Only ${ev.seats} left in stock - order soon.`}
                </p>
              </div>

              {/* Dynamic Action Controls */}
              {qtyInCart > 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0f2f2", padding: "6px 12px", borderRadius: "20px", border: "1px solid #d5d9d9" }}>
                  <button
                    onClick={() => updateQuantity(ev._id, "decrement")}
                    style={{ background: "#e7e9ec", border: "1px solid #adb1b8", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                    {qtyInCart} in Cart
                  </span>
                  <button
                    onClick={() => updateQuantity(ev._id, "increment")}
                    style={{ background: "#ffd814", border: "1px solid #fcd200", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  className={isSoldOut ? "amz-btn-secondary" : "amz-btn-primary"}
                  disabled={isSoldOut}
                  onClick={() => addToCart(ev._id)}
                >
                  {isSoldOut ? "Unavailable" : "Add Tickets to Cart"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Events;