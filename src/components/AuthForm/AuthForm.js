import { useState } from "react";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import "./AuthForm.css";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!email.includes("@")) return toast.error("Invalid email format");
    if (password.length < 6) return toast.error("Password too short");

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        if (!user.emailVerified) {
          await auth.signOut();
          return toast.error("Email not verified. Check your inbox.");
        }

        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await sendEmailVerification(user);
        toast.success(
          "Verification email sent. Please verify before logging in."
        );

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

        await auth.signOut();
      }
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
          toast.error("User not found.");
          break;
        case "auth/email-already-in-use":
          toast.error("Email already in use.");
          break;
        case "auth/too-many-requests":
          toast.error("Too many attempts. Try again later.");
          break;
        default:
          toast.error("Authentication failed.");
          break;
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return toast.error("Enter your email to reset password");
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent.");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Failed to send reset email. Check the email address.");
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

      <div className="authform">
        {/* <video className="authform-video" autoPlay muted loop playsInline>
          <source src="/images/authform-bg-video4.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}

        {/* 🔄 Toggle Buttons ABOVE the form card */}
        <div className="form-toggle-buttons">
          <button
            type="button"
            className={`toggle-btn ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            🔐 Login
          </button>
          <button
            type="button"
            className={`toggle-btn ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            ✍️ Register
          </button>
        </div>

        <form className="authform-inner" onSubmit={handleAuth}>
          <h2 className="authform-title">
            {isLogin ? "Welcome Back!" : "Create Your Account"}
          </h2>

          <input
            className="authform-input"
            type="email"
            placeholder="Email address"
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

          {isLogin && (
            <p className="authform-forgot" onClick={handleForgotPassword}>
              Forgot password?
            </p>
          )}

          <button className="authform-button" type="submit">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
