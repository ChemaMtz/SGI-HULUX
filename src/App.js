import React, { useEffect, useState } from "react";
import "./App.css";
import './responsive.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Devolucion from "./pages/Devolucion";
import OrdenTrabajo from "./pages/OrdenTrabajo";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import ProtectedRoute from './components/ProtectedRoute';
import { auth } from './firebase/firebaseConfig';
import Navigation from './components/Navigation';
import { signOut } from 'firebase/auth';

const AppContent = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const hideNavbarRoutes = ['/login'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {shouldShowNavbar && <Navigation user={user} onLogout={handleLogout} />}
      
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute user={user}>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/devolucion" element={
            <ProtectedRoute user={user}>
              <Devolucion />
            </ProtectedRoute>
          } />

          <Route path="/orden-trabajo" element={
            <ProtectedRoute user={user}>
              <OrdenTrabajo />
            </ProtectedRoute>
          } />

          <Route path="/admin-panel" element={
            <ProtectedRoute user={user} adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;