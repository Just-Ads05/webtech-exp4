import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(API + "/auth/register", {
        name,
        email,
        password,
      });
      setMessage(res.data.message);
    } catch (err) {
      if (err.response) setMessage(err.response.data.message);
      else setMessage("Server not reachable");
    }
  }

  return (
    <div className="amz-auth-box">
      <h2>Create account</h2>

      {message && (
        <p
          style={{
            fontSize: "0.85rem",
            color: message.toLowerCase().includes("success")
              ? "#007600"
              : "#b12704",
            marginBottom: "10px",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
          Your name
        </label>
        <input
          className="amz-input"
          placeholder="First and last name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
          Email
        </label>
        <input
          className="amz-input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
          Password
        </label>
        <input
          className="amz-input"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <p style={{ fontSize: "0.75rem", color: "#565959", marginBottom: "15px" }}>
          Passwords must be at least 6 characters.
        </p>

        <button
          type="submit"
          className="amz-btn-primary"
          style={{ marginTop: "5px" }}
        >
          Create your TechFest account
        </button>
      </form>

      <p style={{ fontSize: "0.75rem", color: "#565959", marginTop: "15px" }}>
        By creating an account, you agree to TechFest's Conditions of Use and Privacy Notice.
      </p>
    </div>
  );
}

export default Signup;