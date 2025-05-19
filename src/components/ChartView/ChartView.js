import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#00c49f",
  "#ffbb28",
];

const ChartView = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "entries"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((doc) => doc.data());
      const categoryTotals = {};

      entries.forEach((e) => {
        const key = e.category;
        const val = e.type === "income" ? e.amount : -e.amount;
        categoryTotals[key] = (categoryTotals[key] || 0) + val;
      });

      const chartData = Object.entries(categoryTotals).map(
        ([category, total]) => ({
          name: category,
          value: Math.abs(total), // Always show as positive in pie
        })
      );

      setData(chartData);
    });

    return () => unsub();
  }, [user]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartView;
