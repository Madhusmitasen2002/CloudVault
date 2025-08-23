
import AuthProvider, { useAuth, Protected } from "../context/AuthContext";


export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 flex items-center px-4 border-b bg-white">
        <div className="font-semibold">Profile</div>
      </header>
      <main className="p-6">
        <div className="max-w-lg bg-white rounded border p-4">
          <div className="mb-2"><span className="font-medium">User ID:</span> {user?.id}</div>
          <div><span className="font-medium">Email:</span> {user?.email}</div>
        </div>
      </main>
    </div>
  );
}
