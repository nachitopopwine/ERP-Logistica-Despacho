import './Home.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../utils/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogisticaDespacho = () => {
    navigate('/'); // va al módulo de Logística/Despacho (ERP Logística actual)
  };

  const handleNoAccess = () => {
    alert('No tienes acceso al módulo seleccionado');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-container">
      <h1>Bienvenido al Mini-ERP</h1>
      <p>Selecciona el módulo al que deseas ingresar:</p>

      <div className="module-grid">
        <button className="module-button disabled" onClick={handleNoAccess}>
          Inventario
        </button>

        <button className="module-button disabled" onClick={handleNoAccess}>
          Ventas
        </button>

        <button className="module-button disabled" onClick={handleNoAccess}>
          Compras
        </button>

        <button className="module-button disabled" onClick={handleNoAccess}>
          RRHH
        </button>
        
        <button
          className="module-button"
          onClick={handleLogisticaDespacho}
        >
          Logística/Despacho
        </button>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
};

export default Home;
