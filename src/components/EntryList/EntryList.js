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

  useEffect(() => {
    const q = query(collection(db, "entries"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

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

  return (
    <div className="entrylist-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h3 className="entrylist-balance">💰 Balance: ₹{balance.toFixed(2)}</h3>

      {entries.length === 0 ? (
        <p className="entrylist-empty">
          No entries yet. Add one to get started!
        </p>
      ) : (
        entries.map((e) => (
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
