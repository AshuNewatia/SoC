import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Workspace from "./pages/WorkSpace";
import MyBoard from "./pages/MyBoard";
import OAuthCallback from "./pages/OAuthCallback";

import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/header/Header";
import { useAuth } from "./context/authContext";


// function ProtectedRoute({ children }) {
//   const { user, loading } = useAuth();
//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }
//   if (!user) {
//     return <Navigate to="/login" />;
//   }
//   return children;
// }

// This layout includes the responsive sidebar + header
function AuthenticatedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
  <Sidebar
    isOpen={sidebarOpen}
    onClose={() => setSidebarOpen(false)}
  />

  <main className="flex-1 flex flex-col overflow-hidden">
    <Header onMenuClick={() => setSidebarOpen(true)} />

    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </main>
</div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* Protected Routes with both guards and the responsive layout */}
        <Route
          path="/dashboard"
          element={
            // <ProtectedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            // <ProtectedRoute>
              <AuthenticatedLayout>
                <Analytics />
              </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            // <ProtectedRoute>
              <AuthenticatedLayout>
                <Settings />
              </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/:id"
          element={
            // <ProtectedRoute>
              <AuthenticatedLayout>
                <Workspace />
              </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/myboard"
          element={
            // <ProtectedRoute>
              <AuthenticatedLayout>
                <MyBoard />
              </AuthenticatedLayout>
            // </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
