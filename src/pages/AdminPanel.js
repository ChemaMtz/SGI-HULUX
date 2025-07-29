import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';
import MaterialTable from '../components/MaterialTable';
import OrdenTrabajoTable from '../components/OrdenTrabajoTable';

const ADMIN_EMAIL = 'admin@hulux.com'; // Cambia por el correo real del administrador

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate('/'); // Redirige si no es admin
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (!isAdmin) return null;

  // Estilos en línea
  const styles = {
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: '#f9f9f9',
      minHeight: '100vh',
    },
    card: {
      background: '#ffffff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)',
      marginBottom: '2rem',
    },
    title: {
      textAlign: 'center',
      fontSize: '2rem',
      color: '#2c3e50',
      marginBottom: '2rem',
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: '1.4rem',
      color: '#34495e',
      marginBottom: '1rem',
      borderBottom: '2px solid #3498db',
      paddingBottom: '0.5rem',
    },
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Panel de Administración</h2>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Devolución de Materiales</h3>
        <MaterialTable />
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Órdenes de Trabajo</h3>
        <OrdenTrabajoTable />
      </div>
    </div>
  );
};

export default AdminPanel;
