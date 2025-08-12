// Importaciones necesarias para el componente de autenticación
import React, { useState } from 'react'; // React con hook useState para manejo de estado
import {
  signInWithEmailAndPassword, // Función para iniciar sesión con email/password
  createUserWithEmailAndPassword, // Función para crear cuenta nueva
  signInWithPopup, // Función para autenticación con proveedores externos
  GoogleAuthProvider, // Proveedor de autenticación de Google
  FacebookAuthProvider, // Proveedor de autenticación de Facebook
  updateProfile // Función para actualizar el perfil del usuario
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig'; // Configuración de Firebase Auth
import { useNavigate } from 'react-router-dom'; // Hook para navegación programática
import { FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa'; // Iconos de Font Awesome
import HuluxLogo from '../Hulux.jpg'; // Logo principal de la empresa
import GoogleLogo from '../assets/Google.png'; // Logo de Google para el botón
import FacebookLogo from '../assets/Facebook.png'; // Logo de Facebook para el botón
import '../App.css'; // Estilos CSS personalizados

/**
 * Componente Login
 * 
 * Componente completo de autenticación que maneja múltiples métodos de inicio de sesión
 * y registro de usuarios. Incluye autenticación tradicional con email/password y
 * autenticación social con Google y Facebook.
 * 
 * Características principales:
 * - Autenticación con email y contraseña
 * - Registro de nuevos usuarios
 * - Autenticación social (Google, Facebook)
 * - Interfaz responsive y profesional
 * - Manejo de estados de carga y errores
 * - Logos personalizados e integración visual
 * - Navegación automática tras autenticación exitosa
 * 
 * @param {Object|null} user - Usuario autenticado actual o null
 * @param {Function} onLogin - Callback ejecutado tras login exitoso
 * @param {Function} onLogout - Callback ejecutado para cerrar sesión
 */
const Login = ({ user, onLogin, onLogout }) => {
  // Estados del componente para manejo de formulario y UI
  const [email, setEmail] = useState(''); // Email ingresado por el usuario
  const [password, setPassword] = useState(''); // Contraseña ingresada
  const [fullName, setFullName] = useState(''); // Nombre completo (solo para registro)
  const [error, setError] = useState(''); // Mensajes de error para mostrar al usuario
  const [isRegister, setIsRegister] = useState(false); // Toggle entre login y registro
  const [isLoading, setIsLoading] = useState(false); // Estado de carga para mostrar feedback

  // Hook para navegación programática después de autenticación exitosa
  const navigate = useNavigate();

  /**
   * Función para limpiar todos los campos del formulario
   * 
   * Útil para resetear el estado cuando se cambia entre login y registro
   * o después de operaciones exitosas.
   */
  const clearFields = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
  };

  /**
   * Función para alternar entre modo login y registro
   * 
   * Limpia los campos para evitar confusión entre los diferentes modos
   * y proporciona una experiencia de usuario más limpia.
   */
  const toggleMode = () => {
    setIsRegister(!isRegister);
    clearFields(); // Limpiar campos al cambiar de modo
  };

  /**
   * Manejador del formulario de login/registro tradicional
   * 
   * @param {Event} e - Evento del formulario
   * 
   * Gestiona tanto el inicio de sesión como el registro de nuevos usuarios
   * usando email y contraseña. Para registro, también guarda el nombre completo
   * en el perfil del usuario. Incluye manejo de errores y navegación automática.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir comportamiento por defecto del formulario
    setError(''); // Limpiar errores previos
    setIsLoading(true); // Activar estado de carga
    
    try {
      if (isRegister) {
        // Validaciones específicas para registro
        if (!fullName.trim()) {
          setError('El nombre completo es requerido para el registro');
          setIsLoading(false);
          return;
        }
        
        if (fullName.trim().length < 2) {
          setError('El nombre completo debe tener al menos 2 caracteres');
          setIsLoading(false);
          return;
        }
        
        // Validar que el nombre tenga al menos 2 palabras (nombre y apellido)
        if (fullName.trim().split(' ').length < 2) {
          setError('Por favor ingresa tu nombre completo (nombre y apellido)');
          setIsLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setIsLoading(false);
          return;
        }
        
        // Crear nueva cuenta de usuario
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Actualizar el perfil del usuario con el nombre completo
        await updateProfile(userCredential.user, {
          displayName: fullName.trim()
        });
        
        // Limpiar campos después de registro exitoso
        clearFields();
      } else {
        // Iniciar sesión con credenciales existentes
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Ejecutar callback de login si existe
      if (onLogin) onLogin();
      
      // Navegar a la página principal
      navigate('/');
    } catch (err) {
      // Manejo de errores con mensajes específicos
      setError(isRegister
        ? 'Error al registrar: ' + err.message
        : 'Credenciales incorrectas o usuario no registrado');
    } finally {
      // Siempre desactivar estado de carga
      setIsLoading(false);
    }
  };

  /**
   * Manejador para autenticación con Google
   * 
   * Utiliza Firebase Authentication con Google como proveedor externo.
   * Abre popup de Google para autenticación y maneja el flujo completo.
   */
  const handleGoogleLogin = async () => {
    setError(''); // Limpiar errores previos
    setIsLoading(true); // Activar estado de carga
    
    try {
      // Crear proveedor de Google y ejecutar popup de autenticación
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      // Ejecutar callback y navegar tras éxito
      if (onLogin) onLogin();
      navigate('/');
    } catch (err) {
      // Manejo específico de errores de Google
      setError('Error con Google: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manejador para autenticación con Facebook
   * 
   * Utiliza Firebase Authentication con Facebook como proveedor externo.
   * Abre popup de Facebook para autenticación y maneja el flujo completo.
   */
  const handleFacebookLogin = async () => {
    setError(''); // Limpiar errores previos
    setIsLoading(true); // Activar estado de carga
    
    try {
      // Crear proveedor de Facebook y ejecutar popup de autenticación
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      
      // Ejecutar callback y navegar tras éxito
      if (onLogin) onLogin();
      navigate('/');
    } catch (err) {
      // Manejo específico de errores de Facebook
      setError('Error con Facebook: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Contenedor principal con fondo personalizado
    <div className="login-bg">
      <div className="login-overlay">
        <div className="login-card">
          {/* Logo de la empresa */}
          <img src={HuluxLogo} alt="Logo Hulux" style={{ height: '80px', borderRadius: '50%', marginBottom: '1rem' }} />
          
          {/* Renderizado condicional basado en estado de autenticación */}
          {user ? (
            // Si el usuario ya está autenticado, mostrar información y opción de logout
            <div className="text-center">
              <p className="text-muted">Sesión iniciada como <strong>{user.email}</strong></p>
              <button onClick={onLogout} className="btn btn-danger w-100 rounded-pill mt-2">
                <FaSignOutAlt className="me-2" /> Cerrar sesión
              </button>
            </div>
          ) : (
            // Si no está autenticado, mostrar formulario de login/registro
            <form onSubmit={handleSubmit} className="w-100">
              {/* Título dinámico del formulario */}
              <h4 className="text-center mb-4">
                {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </h4>

              {/* Mostrar errores si existen */}
              {error && <div className="alert alert-danger text-center">{error}</div>}

              {/* Campo de nombre completo - solo visible en modo registro */}
              {isRegister && (
                <div className="mb-3 register-field" key="fullname-field">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre completo (ej: Juan Pérez García)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
              )}

              {/* Campo de email */}
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

              {/* Campo de contraseña */}
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder={isRegister ? "Contraseña (mínimo 6 caracteres)" : "Contraseña"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isRegister ? 6 : undefined}
                />
              </div>

              {/* Botón principal de submit con estado de carga */}
              <button 
                type="submit" 
                className="btn btn-primary w-100 rounded-pill mb-3" 
                disabled={isLoading}
                key="submit-button"
              >
                {isLoading ? (
                  <span key="loading-text">Cargando...</span>
                ) : (
                  <span key={isRegister ? "register-content" : "login-content"}>
                    {isRegister ? (
                      <>
                        <FaUserPlus className="me-2" />
                        Registrarse
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" />
                        Iniciar sesión
                      </>
                    )}
                  </span>
                )}
              </button>

              {/* Toggle entre login y registro */}
              <div className="text-center mb-3" key="toggle-section">
                <small key={isRegister ? "register-prompt" : "login-prompt"}>
                  {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
                  <button
                    type="button"
                    className="btn btn-link btn-toggle p-0 ms-2"
                    onClick={toggleMode}
                    key="toggle-button"
                  >
                    {isRegister ? 'Iniciar sesión' : 'Regístrate'}
                  </button>
                </small>
              </div>

              {/* Sección de autenticación social */}
              <div className="text-center" key="social-auth-section">
                <small className="text-muted">O ingresa con</small>
                <div className="d-flex justify-content-center mt-2 gap-3">
                  {/* Botón de Google con logo personalizado */}
                  <button
                    type="button"
                    className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                    style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    key="google-login-button"
                  >
                    <img src={GoogleLogo} alt="Google" style={{ width: '20px' }} />
                  </button>
                  
                  {/* Botón de Facebook con logo personalizado */}
                  <button
                    type="button"
                    className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                    style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                    onClick={handleFacebookLogin}
                    disabled={isLoading}
                    key="facebook-login-button"
                  >
                    <img src={FacebookLogo} alt="Facebook" style={{ width: '40px' }} />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
