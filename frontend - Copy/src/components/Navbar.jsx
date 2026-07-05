export default function Navbar() {
  return (
    <div className="bg-white shadow p-4 flex justify-between">

      <h2 className="font-bold text-xl">
        LearnIQ
      </h2>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

    </div>
  );
}