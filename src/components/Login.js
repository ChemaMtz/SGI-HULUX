import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaSignOutAlt, FaGoogle, FaFacebook } from 'react-icons/fa';
import HuluxLogo from '../Hulux.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = ({ user, onLogin, onLogout }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onLogin) onLogin();
      navigate('/');
    } catch (err) {
      setError(isRegister ? 'Error al registrar: ' + err.message : 'Credenciales incorrectas o usuario no registrado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-dark text-light">
      <div className="card shadow w-100" style={{ maxWidth: '450px' }}>
        <div className="card-header text-center bg-light">
          <img src={HuluxLogo} alt="Logo Hulux" style={{ height: '80px', objectFit: 'contain' }} />
        </div>

        {user ? (
          <div className="card-body text-center">
            <p className="text-muted">Sesión iniciada como <strong>{user.email}</strong></p>
            <button onClick={onLogout} className="btn btn-danger w-100">
              <FaSignOutAlt className="me-2" /> Cerrar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-body">
            <h3 className="card-title text-center mb-4">
              {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h3>

            {error && <div className="alert alert-danger text-center">{error}</div>}

            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isLoading}>
              {isLoading ? 'Cargando...' : (
                <>
                  {isRegister ? <FaUserPlus className="me-2" /> : <FaSignInAlt className="me-2" />}
                  {isRegister ? 'Registrarse' : 'Iniciar sesión'}
                </>
              )}
            </button>

            <div className="text-center mb-3">
              <small>
                {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                <button
                  type="button"
                  className="btn btn-link p-0 ms-2"
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? 'Iniciar sesión' : 'Regístrate'}
                </button>
              </small>
            </div>

            <div className="text-center">
              <small className="text-muted">O ingresa con</small>
              <div className="d-flex justify-content-center mt-2 gap-3">
                <FaGoogle style={{ fontSize: '1.5rem', cursor: 'pointer' }} />
                <FaFacebook style={{ fontSize: '1.5rem', cursor: 'pointer' }} />
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
