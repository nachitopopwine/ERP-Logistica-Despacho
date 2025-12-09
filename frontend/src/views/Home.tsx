import './Home.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../utils/AuthContext";
import { PERMISSIONS, ROLES, hasPermission } from "../utils/Permissions";

const Home = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const irACompras = () => {
    navigate('/compras');
  };

  const irARRHH = () => {
    navigate('/rrhh');
  };

  const irALogistica = () => {
    // Verificar el rol y redirigir a la página correspondiente
    const rol = user?.rol;

    switch (rol) {
      case ROLES.JEFE_LOGISTICA:
      case ROLES.ADMIN:
      case ROLES.GERENTE:
        // Jefes van a procesar pedidos automáticos
        navigate('/procesar-automatico');
        break;

      case ROLES.EMPLEADO_LOGISTICA:
      
        // Empleados van a listar órdenes de picking
        navigate('/listar-picking');
        break;

      case ROLES.TRANSPORTISTA:
        // Transportistas van a ver guías de despacho
        navigate('/listar-guias');
        break;

      default:
        // Si tiene permiso de logística pero no es un rol específico
        if (hasPermission(user?.rol as any, "puedeVerLogistica")) {
          navigate('/listar-picking');
        } else {
          alert("No tienes permisos para acceder al módulo de Logística");
        }
        break;
    }
  };

  // Verificar si tiene permiso de logística
  const canSeeLogistica = user?.rol ? hasPermission(user.rol as any, "puedeVerLogistica") : false;

// 👇 AGREGAR ESTAS LÍNEAS TEMPORALES
console.log("=== DEBUG HOME ===");
console.log("Usuario:", user);
console.log("Rol:", user?.rol);
console.log("canSeeLogistica:", canSeeLogistica);
console.log(
  "Permisos del rol:",
  user?.rol ? PERMISSIONS[user.rol as keyof typeof PERMISSIONS] : "No hay permisos"
);

  return (
    <div className="home-container">
      <h1>Bienvenido al Mini-ERP</h1>
      <p>Selecciona el módulo al que deseas ingresar:</p>

      <div className="module-grid">
        {/* Módulo de Compras - SIEMPRE VISIBLE */}
        <button className="module-button" onClick={irACompras}>
          📦 Compras
        </button>

        {/* Módulo de RRHH - SIEMPRE VISIBLE */}
        <button className="module-button" onClick={irARRHH}>
          👥 RRHH
        </button>

        {/* Módulo de Logística - SOLO SI TIENE PERMISO */}
        {canSeeLogistica && (
          <button className="module-button" onClick={irALogistica}>
            🚚 Logística
          </button>
        )}
      </div>

      {/* Información del usuario (opcional, puedes comentar si no quieres) */}
      <div className="user-info">
        <p>
          <strong>Usuario:</strong> {user?.nombre} {user?.apellido}
        </p>
        <p>
          <strong>Rol:</strong> {user?.rol}
        </p>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
};

export default Home;