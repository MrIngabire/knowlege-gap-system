import {
  FaHome,
  FaBrain,
  FaBook,
  FaChartLine,
  FaQuestionCircle,
  FaFileAlt,
  FaHistory,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Sidebar() {
  const { user } = useAuth();
  const isLecturer = user?.role === "lecturer";

  const linkClass = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded transition ${
      isActive ? "bg-slate-800" : "hover:bg-slate-800"
    }`;

  return (
    <aside className="w-64 h-full bg-slate-900 text-white flex-shrink-0 overflow-y-auto">
      <div className="p-6 text-2xl font-bold border-b border-slate-700">
        Knowledge Gap System
      </div>
      <nav className="p-4">
        {isLecturer ? (
          <>
            <NavLink to="/lecturer" className={linkClass}>
              <FaHome className="mr-3" /> Dashboard
            </NavLink>
            <NavLink to="/lecturer/courses" className={linkClass}>
              <FaBook className="mr-3" /> Manage Courses
            </NavLink>
            <NavLink to="/lecturer/questions" className={linkClass}>
              <FaQuestionCircle className="mr-3" /> Questions
            </NavLink>
            <NavLink to="/lecturer/resources" className={linkClass}>
              <FaFileAlt className="mr-3" /> Resources
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={linkClass}>
              <FaHome className="mr-3" /> Dashboard
            </NavLink>
            <NavLink to="/quiz" className={linkClass}>
              <FaBook className="mr-3" /> Quiz
            </NavLink>
            <NavLink to="/recommendations" className={linkClass}>
              <FaBrain className="mr-3" /> Recommendations
            </NavLink>
            <NavLink to="/analytics" className={linkClass}>
              <FaChartLine className="mr-3" /> Analytics
            </NavLink>
            <NavLink to="/attempts" className={linkClass}>
              <FaHistory className="mr-3" /> Attempt History
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}