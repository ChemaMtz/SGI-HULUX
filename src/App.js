// Importaciones necesarias: React, estilos, rutas y componentes
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

// Componente principal que maneja la navegación y autenticación
const AppContent = () => {
  // Estado para el usuario autenticado
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Rutas donde no se debe mostrar la barra de navegación
  const hideNavbarRoutes = ['/login'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {/* Mostrar navegación solo en rutas específicas */}
      {shouldShowNavbar && <Navigation key="main-navigation" user={user} onLogout={handleLogout} />}
      
      <main className="main-content">
        <Routes>
          {/* Ruta pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Ruta protegida - Página principal */}
          <Route path="/" element={
            <ProtectedRoute user={user}>
              <Home />
            </ProtectedRoute>
          } />

          {/* Ruta protegida - Devolución de materiales */}
          <Route path="/devolucion" element={
            <ProtectedRoute user={user}>
              <Devolucion />
            </ProtectedRoute>
          } />

          {/* Ruta protegida - Órdenes de trabajo */}
          <Route path="/orden-trabajo" element={
            <ProtectedRoute user={user}>
              <OrdenTrabajo />
            </ProtectedRoute>
          } />

          {/* Ruta protegida solo para admin - Panel administrativo */}
          <Route path="/admin-panel" element={
            <ProtectedRoute user={user} adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* Ruta 404 - Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

// Componente App principal que envuelve todo en el Router
function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppContent />
    </Router>
  );
}

export default App;