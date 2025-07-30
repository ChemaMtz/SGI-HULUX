// Importaciones necesarias: React, Firebase Auth, navegación y estilos
import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import HuluxLogo from '../Hulux.jpg';
import GoogleLogo from '../assets/Google.png';
import FacebookLogo from '../assets/Facebook.png';
import 'bootstrap/dist/css/bootstrap.min.css';

// Componente de Login que maneja sesión, registro y redes sociales
const Login = ({ user, onLogin, onLogout }) => {
  // Estado para email y contraseña del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estado para errores, modo registro/inicio, y carga
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Maneja login/registro con correo y contraseña
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        // Registro con correo
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Inicio de sesión con correo
        await signInWithEmailAndPassword(auth, email, password);
      }

      if (onLogin) onLogin(); // Notificar a componente padre
      navigate('/'); // Redirigir al home
    } catch (err) {
      // Mensaje personalizado según acción
      setError(isRegister
        ? 'Error al registrar: ' + err.message
        : 'Credenciales incorrectas o usuario no registrado');
    } finally {
      setIsLoading(false);
    }
  };

  // Login con Google usando popup
  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      if (onLogin) onLogin();
      navigate('/');
    } catch (err) {
      setError('Error con Google: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Login con Facebook usando popup
  const handleFacebookLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      if (onLogin) onLogin();
      navigate('/');
    } catch (err) {
      setError('Error con Facebook: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-dark text-light">
      <div className="card shadow w-100" style={{ maxWidth: '450px' }}>
        <div className="card-header text-center bg-light">
          {/* Logo de la empresa */}
          <img src={HuluxLogo} alt="Logo Hulux" style={{ height: '80px', objectFit: 'contain', borderRadius: '50%' }} />
        </div>

        {user ? (
          // Si ya hay sesión activa
          <div className="card-body text-center">
            <p className="text-muted">Sesión iniciada como <strong>{user.email}</strong></p>
            <button onClick={onLogout} className="btn btn-danger w-100">
              <FaSignOutAlt className="me-2" /> Cerrar sesión
            </button>
          </div>
        ) : (
          // Formulario de login o registro
          <form onSubmit={handleSubmit} className="card-body">
            <h3 className="card-title text-center mb-4">
              {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h3>

            {/* Mostrar error si existe */}
            {error && <div className="alert alert-danger text-center">{error}</div>}

            {/* Input de correo */}
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

            {/* Input de contraseña */}
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

            {/* Botón de acción (login o registro) */}
            <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isLoading}>
              {isLoading ? 'Cargando...' : (
                <>
                  {isRegister ? <FaUserPlus className="me-2" /> : <FaSignInAlt className="me-2" />}
                  {isRegister ? 'Registrarse' : 'Iniciar sesión'}
                </>
              )}
            </button>

            {/* Opción para alternar entre registro y login */}
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

            {/* Acceso con Google o Facebook */}
            <div className="text-center">
              <small className="text-muted">O ingresa con</small>
              <div className="d-flex justify-content-center mt-2 gap-3">
                <button
                  type="button"
                  className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                  style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  aria-label="Iniciar sesión con Google"
                >
                  <img src={GoogleLogo} alt="Google" style={{ width: '20px', height: '20px' }} />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                  style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                  aria-label="Iniciar sesión con Facebook"
                >
                  <img src={FacebookLogo} alt="Facebook" style={{ width: '40px', height: '25px' }} />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
