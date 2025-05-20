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
import autoTable from "jspdf-autotable";

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
          "#FF6384", // soft red
          "#36A2EB", // sky blue
          "#FFCE56", // light yellow
          "#9b59b6", // purple
          "#2ecc71", // green
          "#f39c12", // orange
          "#e74c3c", // vivid red
          "#1abc9c", // teal
          "#34495e", // dark blue-gray
          "#8e44ad", // deep purple
        ],
        borderWidth: 1,
      },
    ],
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    // const userName = user.displayName || "User";
    const totalBalance = entries.reduce((sum, entry) => {
      return entry.type === "income" ? sum + entry.amount : sum - entry.amount;
    }, 0);

    // Title
    doc.setFontSize(18);
    doc.text("Expense Tracker Report", 14, 22);

    // User info and balance
    doc.setFontSize(12);
    doc.setTextColor(100);
    // doc.text(`Name: ${userName}`, 14, 30);
    doc.text(`Current Balance: ${totalBalance.toFixed(2)}`, 150, 30);

    // Table content
    const tableColumn = ["Type", "Category", "Amount (₹)", "Date", "Note"];
    const tableRows = [];

    entries.forEach(({ type, category, amount, date, note }) => {
      const rowData = [
        type.charAt(0).toUpperCase() + type.slice(1),
        category,
        amount.toFixed(2),
        date,
        note || "N/A",
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 12,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
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
          <button className="profile-icon" onClick={() => navigate("/profile")}>
            <img
              src="/images/profile-icon.jpg" // You can use user's photoURL too
              alt="Profile"
              className="profile-img"
            />
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
