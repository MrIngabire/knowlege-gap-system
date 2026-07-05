import {
  FaHome,
  FaBrain,
  FaBook,
  FaChartLine,
} from "react-icons/fa";

import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white">

      <div className="p-6 text-2xl font-bold">
        LearnIQ
      </div>

      <nav>

        <Link
          to="/dashboard"
          className="block px-6 py-4 hover:bg-slate-800"
        >
          <FaHome className="inline mr-3" />
          Dashboar
        </Link>

        <Link
          to="/quiz"
          className="block px-6 py-4 hover:bg-slate-800"
        >
          <FaBook className="inline mr-3" />
          Quiz
        </Link>

        <Link
          to="/recommendations"
          className="block px-6 py-4 hover:bg-slate-800"
        >
          <FaBrain className="inline mr-3" />
          Recommendations
        </Link>

        <Link
          to="/analytics"
          className="block px-6 py-4 hover:bg-slate-800"
        >
          <FaChartLine className="inline mr-3" />
          Analytics
        </Link>

      </nav>

    </aside>
  );
}