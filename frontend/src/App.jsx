import { Routes, Route, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import Login from "./components/Auth/Login"
import Register from "./components/Auth/Register"
import BankDashboard from "./components/Bank/BankDashboard"
import AgentDashboard from "./components/Agent/AgentDashboard"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to={user.role === "bank" ? "/bank" : "/agent"} />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to={user.role === "bank" ? "/bank" : "/agent"} />}
        />

        <Route
          path="/bank/*"
          element={
            <ProtectedRoute allowedRoles={["bank"]}>
              <BankDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent/*"
          element={
            <ProtectedRoute allowedRoles={["agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
