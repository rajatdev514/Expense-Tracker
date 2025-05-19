// import { useEffect, useState } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { Navigate } from "react-router-dom";
// import { auth } from "../firebase";

// const PrivateRoute = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [checkingStatus, setCheckingStatus] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setCheckingStatus(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (checkingStatus) {
//     return <p>Loading...</p>;
//   }

//   if (!user) {
//     alert("Please login first.");
//     return <Navigate to="/" />;
//   }

//   return children;
// };

// export default PrivateRoute;
