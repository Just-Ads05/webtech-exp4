import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function MyRegistrations({ user }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = user?.token || localStorage.getItem("token");
    if (!token) {
      setError("Please login to view active registrations.");
      return;
    }

    const config = { headers: { Authorization: "Bearer " + token } };
    axios
      .get(API + "/registrations/my", config)
      .then((res) => setOrders(res.data))
      .catch(() => setError("Failed to fetch registrations"));
  }, [user]);

  return (
    <div>
      <h2 style={{ marginBottom: "15px", fontWeight: "400" }}>
        Your Active Registrations (Paid Orders)
      </h2>

      {error && (
        <p style={{ color: "#b12704", fontWeight: "bold", marginBottom: "15px" }}>
          {error}
        </p>
      )}

      {orders.length === 0 && !error && (
        <div style={{ background: "white", padding: "20px", borderRadius: "4px", border: "1px solid #ddd" }}>
          <p>No confirmed registrations found.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {orders.map((order) => (
          <div
            key={order._id}
            style={{
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden"
            }}
          >
            {/* Order Header Strip */}
            <div
              style={{
                backgroundColor: "#f6f6f6",
                padding: "12px 18px",
                borderBottom: "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.85rem",
                color: "#565959"
              }}
            >
              <div>
                <div>REGISTRATION DATE</div>
                <div style={{ color: "#0f1111", fontWeight: "bold" }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div>TOTAL PAID</div>
                <div style={{ color: "#b12704", fontWeight: "bold" }}>
                  ₹{order.totalAmount}
                </div>
              </div>
              <div>
                <div>ORDER STATUS</div>
                <div style={{ color: "#007600", fontWeight: "bold" }}>
                  {order.status || "Paid"}
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div>ORDER ID</div>
                <div style={{ color: "#0f1111" }}>#{order._id.slice(-8)}</div>
              </div>
            </div>

            {/* Event Items inside Order */}
            <div style={{ padding: "18px" }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: idx !== order.items.length - 1 ? "12px" : "0",
                    paddingBottom: idx !== order.items.length - 1 ? "12px" : "0",
                    borderBottom: idx !== order.items.length - 1 ? "1px solid #eee" : "none"
                  }}
                >
                  <div>
                    <span className="amz-badge">CONFIRMED PASS</span>
                    <h3 className="amz-card-title" style={{ fontSize: "1.1rem", margin: "4px 0" }}>
                      {item.event?.name || "Event"}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "#565959" }}>
                      Quantity: <strong>{item.quantity} Ticket(s)</strong> | Price: ₹{item.feeAtPurchase}
                    </p>
                  </div>

                  <button className="amz-btn-primary" style={{ width: "auto", padding: "6px 16px" }}>
                    View Pass
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyRegistrations;