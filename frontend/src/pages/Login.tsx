import { useState } from 'react';
import './Login.css';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

const mockUsers = {
  EMPLEADO_LOGISTICA: { email: 'empleado@logistica.cl', role: 'EMPLEADO_LOGISTICA' },
  JEFE_LOGISTICA: { email: 'jefe@logistica.cl', role: 'JEFE_LOGISTICA' },
  TRANSPORTISTA: { email: 'transportista@logistica.cl', role: 'TRANSPORTISTA' }
} as const;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onHandleLogin = () => {
    const found = Object.values(mockUsers).find(u => u.email === email.trim());

    if (!found || password !== '123456') {
      alert('Credenciales inválidas. Usa uno de los correos mock y clave 123456');
      return;
    }

    login(
      {
        nombre: found.role,
        rol: found.role,
        email: found.email,
      },
      'mock-token'
    );
    // Redirigir a la pantalla Home después de un login exitoso
    navigate('/home');
  };

  return (
    <div className="authContainer">
      <div className="loginForm">
        <h1>Iniciar Sesión</h1>
        <div className="formGroup">
          <label>Usuario (email mock):</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="empleado@logistica.cl, jefe@logistica.cl, transportista@logistica.cl"
          />
        </div>
        <div className="formGroup">
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123456"
          />
        </div>
        <button onClick={onHandleLogin}>Iniciar Sesión</button>
      </div>
    </div>
  );
};

export default Login;
