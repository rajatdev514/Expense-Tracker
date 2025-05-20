import "./Profile.css";
import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth } from "../../firebase";
import { deleteUser, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    city: "",
    state: "",
    dob: "",
    gender: "",
    mobile: "",
    photoURL: "",
  });

  const [balance, setBalance] = useState(0);

  // 🔒 Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch profile only if user exists
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data.");
      }
    };

    fetchProfile();
  }, [user]);

  // ✅ Subscribe to entries only if user exists
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "entries"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((doc) => doc.data());
      const total = entries.reduce((sum, e) => {
        return e.type === "income" ? sum + e.amount : sum - e.amount;
      }, 0);
      setBalance(total.toFixed(2));
    });

    return () => unsub();
  }, [user]);

  // ✅ Safe UI fallback (do this AFTER hooks)
  if (!user) return <div>Loading...</div>; // or redirect spinner

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      await setDoc(doc(db, "profiles", user.uid), {
        ...profile,
        email: user.email,
      });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const logout = () => {
    signOut(auth);
    navigate("/");
  };

  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete your account? All your data will be permanently erased and cannot be recovered."
    );

    if (!confirmDelete) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user is currently signed in.");

      // Delete user profile
      await deleteDoc(doc(db, "profiles", currentUser.uid));

      // Delete all entries
      const entriesRef = collection(db, "entries");
      const entriesSnap = await getDocs(
        query(entriesRef, where("uid", "==", currentUser.uid))
      );
      const deletePromises = entriesSnap.docs.map((entryDoc) =>
        deleteDoc(entryDoc.ref)
      );
      await Promise.all(deletePromises);

      // Sign out first to avoid render issues
      await signOut(auth);

      // Delete auth user
      await deleteUser(currentUser);

      toast.success("Account deleted successfully.");
      navigate("/");
    } catch (error) {
      console.error("Account deletion error:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please re-login before deleting your account.");
      } else {
        toast.error("Failed to delete account.");
      }
    }
  };

  return (
    <div className="profile-container">
      {/* Page header with logo */}

      {/* User avatar + balance */}
      <div className="profile-header">
        <div className="profile-topbar">
          <img src="/images/logo.png" alt="Logo" className="profile-logo" />
        </div>
        <div className="profile-photo-div">
          <img
            src={profile.photoURL || "/images/default-avatar.jpg"}
            alt="Profile"
            className="profile-photo"
          />
        </div>
        <div>
          <h2>{profile.name || "Your Name"}</h2>
          <h3>💰 Balance: ₹{balance}</h3>
        </div>
      </div>

      {/* Editable profile form */}
      <div className="profile-form">
        <label>Name</label>
        <input name="name" value={profile.name} onChange={handleChange} />

        <label>Email</label>
        <input value={user.email} disabled />

        <label>City</label>
        <input name="city" value={profile.city} onChange={handleChange} />

        <label>State</label>
        <input name="state" value={profile.state} onChange={handleChange} />

        <label>Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={profile.dob}
          onChange={handleChange}
        />

        <label>Gender</label>
        <select name="gender" value={profile.gender} onChange={handleChange}>
          <option value="">Select</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <label>Mobile No</label>
        <input name="mobile" value={profile.mobile} onChange={handleChange} />

        <label>Profile Photo URL</label>
        <input
          name="photoURL"
          value={profile.photoURL}
          onChange={handleChange}
        />

        <div className="button-group">
          <button className="save-btn" onClick={saveProfile}>
            💾 Save Profile
          </button>
          <button
            className="profile-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            ⬅ Back to Dashboard
          </button>
          <button className="profile-logout-btn" onClick={logout}>
            Logout
          </button>
          <button className="delete-account-btn" onClick={deleteAccount}>
            ❌ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
