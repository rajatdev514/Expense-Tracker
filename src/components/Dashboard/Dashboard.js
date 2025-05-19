import EntryForm from "../EntryForm/EntryForm";
import EntryList from "../EntryList/EntryList";
import "./Dashboard.css";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import jsPDF from "jspdf";

Chart.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("entries");
  const [entries, setEntries] = useState([]);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  const logout = () => {
    signOut(auth);
    navigate("/");
  };

  useEffect(() => {
    const q = query(collection(db, "entries"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const categoryData = entries.reduce((acc, entry) => {
    if (entry.type === "expense") {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    }
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(categoryData),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#9b59b6",
          "#2ecc71",
          "#f39c12",
        ],
        borderWidth: 1,
      },
    ],
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Expense Tracker Report", 14, 22);

    let y = 32;
    doc.setFontSize(12);
    entries.forEach((entry, index) => {
      const { type, category, amount, date, note } = entry;
      doc.text(
        `${
          index + 1
        }. [${type.toUpperCase()}] Category: ${category}, Amount: ₹${amount}, Date: ${date}, Note: ${
          note || "N/A"
        }`,
        14,
        y
      );
      y += 10;

      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("ExpenseTracker_Report.pdf");
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <h2 className="dashboard-title">💸 Expense Tracker</h2>
        <div className="header-controls">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
          <button className="dashboard-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <div className="dashboard-left">
          <EntryForm />
        </div>

        <div className="dashboard-right">
          <div className="tab-buttons">
            <button
              className={activeTab === "entries" ? "tab active" : "tab"}
              onClick={() => setActiveTab("entries")}
            >
              📋 Entries
            </button>
            <button
              className={activeTab === "visual" ? "tab active" : "tab"}
              onClick={() => setActiveTab("visual")}
            >
              📊 Visualization
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "entries" ? (
              <>
                <EntryList />
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <button className="download-btn" onClick={downloadPDF}>
                    📊 Download as PDF
                  </button>
                </div>
              </>
            ) : (
              <div className="chart-container">
                {Object.keys(categoryData).length > 0 ? (
                  <Pie data={pieData} />
                ) : (
                  <p>No expense data to visualize.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
