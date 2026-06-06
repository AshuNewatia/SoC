import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Workspace from "./pages/Workspace";
import OAuthCallback from "./pages/OAuthCallback";

import { useAuth } from "./context/authContext";

// function ProtectedRoute({ children }) {
//   const { user, loading } = useAuth();
//   if (loading) {
//     return <div>Loading...</div>;
//   }
//   if (!user) {
//     return <Navigate to="/login" />;
//   }
//   return children;
// }

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Protected Routes */}

        <Route
          path="/"
          element={
            // <ProtectedRoute>
              <Dashboard />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            // <ProtectedRoute>
              <Analytics />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            // <ProtectedRoute>
              <Settings />
            // </ProtectedRoute>
          }
        />

        <Route
          path="/workspace/:id"
          element={
            // <ProtectedRoute>
              <Workspace />
            // </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;