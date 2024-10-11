// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import JudgeInfoEdit from "./pages/JudgeInfoEdit";
import ProtectedRoute from "./components/ProtectedRoute";
import useFirebaseAuth from "./hooks/useFireAuth";

const App = () => {
  const { currentUser } = useFirebaseAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              element={<AdminDashboard />}
            />
          }
        />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/judgeInfoEdit"
          element={
            <ProtectedRoute
              currentUser={currentUser}
              element={<JudgeInfoEdit />}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
