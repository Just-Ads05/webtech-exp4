import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(API + "/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem("role", res.data.role);

      setUser({ name: res.data.name, role: res.data.role, token: res.data.token });
      navigate("/");
    } catch (err) {
      if (err.response) setMessage(err.response.data.message);
      else setMessage("Server not reachable");
    }
  }

  return (
    <div className="amz-auth-box">
      <h2>Sign-In</h2>
      {message && <p style={{ color: "#b12704", fontWeight: "bold" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input className="amz-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input className="amz-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="amz-btn-primary" style={{ marginTop: "10px" }}>Sign-In</button>
      </form>
    </div>
  );
}

export default Login;