import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { setUser } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div className="bg-white shadow p-4 flex justify-between items-center">
      <h2 className="font-bold text-xl">Knowledge Gap System</h2>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}