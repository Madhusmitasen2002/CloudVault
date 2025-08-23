import { useState } from "react";
import AuthProvider, { useAuth, Protected } from "../context/AuthContext";


export default function Register() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      await signup(name, email, password);
    } catch (e) {
      setErr(e.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded border">
        <h1 className="text-2xl font-semibold mb-5">Create account</h1>
        <input className="w-full mb-3 border rounded px-3 py-2" placeholder="Name"
               value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="w-full mb-3 border rounded px-3 py-2" placeholder="Email"
               value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full mb-4 border rounded px-3 py-2" placeholder="Password" type="password"
               value={password} onChange={(e)=>setPass(e.target.value)} />
        {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
        <button className="w-full py-2 rounded bg-blue-300 text-black">Sign up</button>
      </form>
    </div>
  );
}
