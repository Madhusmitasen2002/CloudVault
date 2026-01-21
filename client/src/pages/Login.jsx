import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    if (!password) return "Password is required";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) return setErr(errorMsg);

    try {
      setErr("");
      setLoading(true);
      const data = await login(email, password);
      navigate("/dashboard");
      console.log("Login response:", data?.token);
      console.log("Token in localStorage:", localStorage.getItem("accessToken"));
    } catch (e) {
      setErr(e.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Welcome Back</h1>

        <div className="space-y-4">
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
          />
        </div>

        {err && <div className="text-sm text-red-600 mt-3 text-center">{err}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-2 rounded-lg bg-blue-500 text-black font-medium hover:bg-blue-600 transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          No account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
