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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
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

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProfile(docSnap.data());
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data.");
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "entries"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((doc) => doc.data());
      const total = entries.reduce(
        (sum, e) => (e.type === "income" ? sum + e.amount : sum - e.amount),
        0
      );
      setBalance(total.toFixed(2));
    });
    return () => unsub();
  }, [user]);

  if (!user) return <div>Loading...</div>;

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // const handlePhoneChange = (value) => {
  //   setProfile({ ...profile, mobile: value });
  // };

  const validateInputs = () => {
    const { name, city, state, dob, gender, mobile, photoURL } = profile;

    if (!name.trim() || !/^[a-zA-Z ]+$/.test(name)) {
      toast.error("Please enter a valid name.");
      return false;
    }

    if (!city.trim()) {
      toast.error("City is required.");
      return false;
    }

    if (!state.trim()) {
      toast.error("State is required.");
      return false;
    }

    if (!dob) {
      toast.error("Please select a valid date of birth.");
      return false;
    }

    if (!gender) {
      toast.error("Please select your gender.");
      return false;
    }

    if (!mobile || !/^\+?\d{10,15}$/.test(mobile)) {
      toast.error("Enter a valid mobile number with country code.");
      return false;
    }

    if (photoURL && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(photoURL)) {
      toast.error("Enter a valid image URL (jpg, png, gif).");
      return false;
    }

    return true;
  };

  const saveProfile = async () => {
    if (!user) return;
    if (!validateInputs()) return;

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
      "⚠️ Are you sure you want to delete your account? All your data will be permanently erased."
    );
    if (!confirmDelete) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user signed in.");

      await deleteDoc(doc(db, "profiles", currentUser.uid));

      const entriesSnap = await getDocs(
        query(collection(db, "entries"), where("uid", "==", currentUser.uid))
      );
      await Promise.all(entriesSnap.docs.map((doc) => deleteDoc(doc.ref)));

      await signOut(auth);
      await deleteUser(currentUser);

      toast.success("Account deleted.");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.code === "auth/requires-recent-login"
          ? "Please re-login before deleting your account."
          : "Failed to delete account."
      );
    }
  };

  return (
    <div className="profile-container">
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
        <div className="profile-header-name">
          <h2>{profile.name || "Your Name"}</h2>
          <h3>💰 Balance: ₹{balance}</h3>
        </div>
      </div>

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
        <PhoneInput
          country={"in"}
          value={profile.mobile}
          onChange={(phone) => setProfile({ ...profile, mobile: phone })}
          inputStyle={{
            width: "100%",
            paddingLeft: "48px", // space for flag
            paddingTop: "0.9rem",
            paddingBottom: "0.9rem",
            fontSize: "1rem",
            backgroundColor: "#ebf8f9",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
          containerStyle={{
            width: "100%",
            marginBottom: "1rem",
          }}
          buttonStyle={{
            borderTopLeftRadius: "8px",
            borderBottomLeftRadius: "8px",
            borderRight: "1px solid #ccc",
            backgroundColor: "#ebf8f9",
          }}
          dropdownStyle={{ zIndex: 9999 }}
        />

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
