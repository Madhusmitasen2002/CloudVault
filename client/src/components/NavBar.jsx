import { Link } from "react-router-dom";
import AuthProvider, { useAuth, Protected } from "../context/AuthContext";


export default function NavBar() {
  const { logout } = useAuth();
  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-white sticky top-0 z-10">
      <Link to="/" className="font-semibold">CloudVault</Link>
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-sm text-gray-700">Profile</Link>
        <button onClick={logout} className="text-sm px-3 py-1 rounded bg-gray-700 text-black">Logout</button>
      </div>
    </header>
  );
}
