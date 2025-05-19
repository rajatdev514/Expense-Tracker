// Import required hooks
import { useState } from "react";
import { auth } from "../../firebase"; // Firebase authentication instance
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./AuthForm.css";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"; // Firebase Auth functions
import { useNavigate } from "react-router-dom"; // Navigation hook for redirecting

const AuthForm = () => {
  // State to toggle between login and register mode
  const [isLogin, setIsLogin] = useState(true);

  // State to store email and password input values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // Hook to programmatically navigate between routes

  // Function to handle form submission
  const handleAuth = async (e) => {
    e.preventDefault(); // Prevent default form reload behavior
    // if (!email.includes("@")) {
    //   return alert("Please enter a valid email address.");
    // }
    // if (password.length < 6) {
    //   return alert("Password must be at least 6 characters long.");
    // }
    if (!isLogin) {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create profile document in Firestore
      await setDoc(doc(db, "profiles", user.uid), {
        name: "", // Empty or default values
        city: "",
        state: "",
        dob: "",
        gender: "",
        mobile: "",
        photoURL: "",
        email: user.email,
      });
    }
    try {
      if (isLogin) {
        // Sign in with Firebase if user is logging in
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Register with Firebase if user is signing up
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard"); // Redirect user to dashboard on success
    } catch (err) {
      alert(err.message); // Show error message if login/register fails
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-info">
        <img className="logo" src="/images/logo.png" alt="logo" />
        <h1>Welcome to ExpenseTracker</h1>
        <p>
          Manage your expenses and income effortlessly. Track your financial
          journey, stay organized, and make smarter money decisions.
        </p>
      </div>

      <form className="authform" onSubmit={handleAuth}>
        <div className="authform-inner">
          <h2 className="authform-title">
            {isLogin ? "Login🔐" : "Register🔒"}
          </h2>

          <input
            className="authform-input"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="authform-input"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="authform-button" type="submit">
            {isLogin ? "Login" : "Register"}
          </button>

          <p className="authform-toggle" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "New user? Register" : "Have an account? Login"}
          </p>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
