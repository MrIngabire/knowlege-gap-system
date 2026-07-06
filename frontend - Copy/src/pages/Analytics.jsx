import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import PageHeader from "../components/PageHeader";

export default function Analytics() {
  const data = [
    { topic: "Variables", score: 95 },
    { topic: "Loops", score: 45 },
    { topic: "Functions", score: 78 },
    { topic: "OOP", score: 88 },
  ];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Performance by topic" />
      <div className="bg-white p-6 rounded-xl shadow">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="topic" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}