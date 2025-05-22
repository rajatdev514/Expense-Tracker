import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EntryList.css";

const EntryList = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);

  // Filter states
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch all entries
  useEffect(() => {
    const q = query(collection(db, "entries"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });
    return () => unsub();
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = entries;

    if (filterType !== "all") {
      filtered = filtered.filter((e) => e.type === filterType);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((e) => e.category === filterCategory);
    }

    if (startDate) {
      filtered = filtered.filter((e) => e.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((e) => e.date <= endDate);
    }

    setFilteredEntries(filtered);
  }, [entries, filterType, filterCategory, startDate, endDate]);

  const deleteEntry = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (confirm) {
      try {
        await deleteDoc(doc(db, "entries", id));
        toast.success("Entry deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete entry.");
      }
    }
  };

  const updateEntry = async (entry) => {
    const newAmount = prompt("Enter new amount", entry.amount);
    if (newAmount) {
      try {
        await updateDoc(doc(db, "entries", entry.id), {
          amount: parseFloat(newAmount),
        });
        toast.success("Entry updated successfully!");
      } catch (err) {
        toast.error("Failed to update entry.");
      }
    }
  };

  const balance = entries.reduce((sum, e) => {
    return e.type === "income" ? sum + e.amount : sum - e.amount;
  }, 0);

  const categories = [
    "Food",
    "Bills",
    "Clothing",
    "Transport",
    "Healthcare",
    "Bike",
    "Grocery",
    "Other",
  ];

  return (
    <div className="entrylist-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h3 className="entrylist-balance">💰 Balance: ₹{balance.toFixed(2)}</h3>

      <div className="entrylist-filters">
        {/* Type Filter */}
        <div className="filter-group">
          <label htmlFor="filter-type">Type</label>
          <select
            id="filter-type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="filter-group">
          <label htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date Filter */}
        <div className="filter-group">
          <label htmlFor="start-date">Start Date</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date Filter */}
        <div className="filter-group">
          <label htmlFor="end-date">End Date</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Entry List */}
      {filteredEntries.length === 0 ? (
        <p className="entrylist-empty">No entries match the filters.</p>
      ) : (
        filteredEntries.map((e) => (
          <div
            className={`entrylist-item ${
              e.type === "income" ? "income" : "expense"
            }`}
            key={e.id}
          >
            <div className="entrylist-details">
              <p>
                <strong>{e.description}</strong> - ₹{e.amount}{" "}
                <span className={`tag ${e.type}`}>{e.type}</span>
              </p>
              <small>
                📅 <em>{e.date}</em> | 🏷️ {e.category}
              </small>
            </div>

            <div className="entrylist-buttons">
              <button className="entrylist-edit" onClick={() => updateEntry(e)}>
                Edit
              </button>
              <button
                className="entrylist-delete"
                onClick={() => deleteEntry(e.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EntryList;
