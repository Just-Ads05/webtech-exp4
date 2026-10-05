import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function CartPage({ user }) {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState("");

  const loadCart = () => {
    if (!user) return;
    const config = { headers: { Authorization: "Bearer " + user.token } };
    axios.get(API + "/cart", config).then((res) => setCart(res.data));
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const updateQuantity = async (eventId, action) => {
    const config = { headers: { Authorization: "Bearer " + user.token } };
    const res = await axios.post(API + "/cart/update", { eventId, action }, config);
    setCart(res.data);
  };

  const handleCheckout = async () => {
    const config = { headers: { Authorization: "Bearer " + user.token } };
    try {
      const res = await axios.post(API + "/cart/checkout", {}, config);
      setMessage("Payment Successful! Order Confirmed.");
      setCart({ items: [] });
    } catch (err) {
      setMessage(err.response?.data?.message || "Payment failed");
    }
  };

  if (!user) return <p>Please login to view your cart.</p>;
  if (!cart) return <p>Loading cart...</p>;

  const totalFee = cart.items.reduce(
    (acc, item) => acc + (item.eventId?.fee || 0) * item.quantity,
    0
  );

  return (
    <div>
      <h2>Shopping Cart</h2>
      {message && <p style={{ color: "#007600", fontWeight: "bold" }}>{message}</p>}

      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <div style={{ flex: 2 }}>
            {cart.items.map((item) => (
              <div
                key={item.eventId._id}
                style={{
                  background: "white",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3>{item.eventId.name}</h3>
                  <p>Price per ticket: ₹{item.eventId.fee}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    className="amz-btn-secondary"
                    style={{ width: "30px", padding: "2px" }}
                    onClick={() => updateQuantity(item.eventId._id, "decrement")}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="amz-btn-secondary"
                    style={{ width: "30px", padding: "2px" }}
                    onClick={() => updateQuantity(item.eventId._id, "increment")}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              flex: 1,
              background: "white",
              padding: "20px",
              borderRadius: "4px",
              height: "fit-content"
            }}
          >
            <h3>Subtotal: ₹{totalFee}</h3>
            <button
              className="amz-btn-primary"
              style={{ marginTop: "15px" }}
              onClick={handleCheckout}
            >
              Pay Now (Checkout)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;