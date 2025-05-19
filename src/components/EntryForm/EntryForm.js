import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../AuthContext";
import "./EntryForm.css";

const EntryForm = () => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); // New state for date
  const [category, setCategory] = useState("Food"); // New state for category
  const { user } = useAuth();

  const addEntry = async (e) => {
    e.preventDefault();
    if (!amount || !description || !date) return;

    await addDoc(collection(db, "entries"), {
      uid: user.uid,
      amount: parseFloat(amount),
      type,
      description,
      category,
      date,
      createdAt: serverTimestamp(),
    });

    setAmount("");
    setDescription("");
    setDate("");
    setCategory("Food");
  };

  return (
    <form className="entryform-form" onSubmit={addEntry}>
      <input
        className="entryform-input"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => {
          const value = e.target.value;
          // Allow only empty input or positive numbers
          if (value === "" || parseFloat(value) >= 0) {
            setAmount(value);
          }
        }}
        min="0"
        step="1"
        required
      />

      <input
        className="entryform-input"
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
        className="entryform-input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <select
        className="entryform-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="Food">Food</option>
        <option value="Bills">Bills</option>
        <option value="Clothing">Clothing</option>
        <option value="Transport">Transport</option>
        <option value="Healthcare">Healthcare</option>
        <option value="Bike">Bike</option>
        <option value="Grocery">Grocery</option>
        <option value="Other">Other</option>
      </select>

      <select
        className="entryform-select"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <button className="entryform-button" type="submit">
        Add Entry
      </button>
    </form>
  );
};

export default EntryForm;
