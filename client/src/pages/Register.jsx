import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validate();
    if (errorMsg) return setErr(errorMsg);

    try {
      setErr("");
      setLoading(true);
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h1>

        <div className="space-y-4">
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          className="w-full mt-6 py-2 rounded-lg text-black font-medium hover:bg-blue-600 transition disabled:opacity-60"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        </p>
      </form>
    </div>
  );
}
