import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="container py-5">
      <div className="text-center p-4 bg-light rounded shadow-sm">
        <h1 className="display-5 fw-bold text-primary">Bienvenido al Sistema de Gestión Integral</h1>
        <p className="lead text-muted mt-3">
          Administra y controla todos los procesos de tu organización desde un solo lugar
        </p>
      </div>

      <div className="row mt-5 g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="display-4 text-info mb-3">📊</div>
              <h5 className="card-title fw-bold">Reportes en Tiempo Real</h5>
              <p className="card-text text-muted">
                Accede a métricas y análisis actualizados de todos tus procesos operativos.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="display-4 text-success mb-3">🔒</div>
              <h5 className="card-title fw-bold">Seguridad Garantizada</h5>
              <p className="card-text text-muted">
                Protección de datos con los más altos estándares de seguridad informática.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <div className="display-4 text-warning mb-3">🔄</div>
              <h5 className="card-title fw-bold">Sincronización Automática</h5>
              <p className="card-text text-muted">
                Todos tus dispositivos actualizados con la información más reciente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
