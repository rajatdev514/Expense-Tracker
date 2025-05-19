import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthForm from "./components/AuthForm/AuthForm";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
