import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import SectionPage from "./pages/SectionPage";
import Login from "./pages/Login";
import AccessManagement from "./pages/AccessManagement";
import { AuthProvider, useAuth } from "./auth";
import { ThemeProvider } from "./theme";
import "./App.css";

function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/threats" element={<SectionPage type="threats" />} />
            <Route path="/alerts" element={<SectionPage type="alerts" />} />
            <Route path="/logs" element={<SectionPage type="logs" />} />
            <Route path="/analytics" element={<SectionPage type="analytics" />} />
            <Route path="/settings" element={<SectionPage type="settings" />} />
            <Route path="/settings/admin-logs" element={user.role === "admin" ? <SectionPage type="admin-logs" /> : <Navigate to="/settings" replace />} />
            <Route path="/access-control" element={user.role === "admin" ? <AccessManagement /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
