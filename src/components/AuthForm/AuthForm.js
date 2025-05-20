import { useState } from "react";
import { auth } from "../../firebase"; // Firebase authentication instance
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./AuthForm.css";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"; // Firebase Auth functions
import { toast } from "react-toastify";
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
    e.preventDefault();

    if (!email.includes("@")) {
      return toast.error("Invalid email format");
    }
    if (password.length < 6) {
      return toast.error("Password should be atleast 6 letters long");
    }

    try {
      if (isLogin) {
        // Login flow
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
      } else {
        // Register flow
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Create Firestore profile
        await setDoc(doc(db, "profiles", user.uid), {
          name: "",
          city: "",
          state: "",
          dob: "",
          gender: "",
          mobile: "",
          photoURL: "",
          email: user.email,
        });
        toast.success("Registered successfully!");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Authentication error:", err);

      switch (err.code) {
        case "auth/invalid-email":
          toast.error("Invalid email format.");
          break;
        case "auth/wrong-password":
          toast.error("Wrong password.");
          break;
        case "auth/user-not-found":
          toast.error("Email is not registered.");
          break;
        case "auth/email-already-in-use":
          toast.error("Email is already registered.");
          break;
        case "auth/too-many-requests":
          toast.error("Too many failed attempts. Please try again later.");
          break;
        default:
          toast.error("Authentication failed. Please try again.");
          break;
      }
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="authform-input"
            type="password"
            placeholder="Password"
            value={password}
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
