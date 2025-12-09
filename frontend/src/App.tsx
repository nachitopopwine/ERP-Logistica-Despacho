import { Routes, Route, Link, useLocation } from "react-router-dom";
import type { ReactElement } from "react";

import { AuthProvider, useAuth, canAccess } from "./utils/AuthContext";
import { ROLES, hasPermission } from "./utils/Permissions";

import Home from "./views/Home";
import Login from "./views/Login";

import ListarOrdenesPicking from "./pages/ListarOrdenesPicking";
import ListarGuiasDespacho from "./pages/ListarGuiasDespacho";
import ListarPedidosVentas from "./pages/ListarPedidosVentas";
import ListarOrdenesCompra from "./pages/ListarOrdenesCompra";
import ProcesarPedidoAutomatico from "./pages/ProcesarPedidoAutomatico";

import InventarioPage from "./Modulo de Inventario/InventarioPage";
import VentasPage from "./Modulo de Ventas";
import ComprasPage from "./Modulo de Compras/ComprasPage";

function ProtectedRoute({
  element,
  requiredPermission,
}: {
  element: ReactElement;
  requiredPermission?: string;
}) {
  const { user, isAuthenticated } = useAuth();
  const token = localStorage.getItem("token");

  if (!isAuthenticated || !token) {
    window.location.replace("/auth");
    return null;
  }

  // Si se especifica un permiso requerido, verificarlo
  if (requiredPermission) {
    const permitted = hasPermission(
      user?.rol as any,
      requiredPermission as any
    );
    
    if (!permitted) {
      alert("No tienes permiso para acceder a esta sección");
      window.location.replace("/");
      return null;
    }
  }

  return element;
}

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  const isAuthRoute = location.pathname === "/auth";

  // Verificar si el usuario tiene permiso para ver logística
  const canSeeLogistica = user?.rol 
    ? hasPermission(user.rol as any, "puedeVerLogistica")
    : false;

  const showNavbar = !isAuthRoute && canSeeLogistica;

  const buttonStyle = {
    color: "white",
    textDecoration: "none",
    padding: "10px 20px",
    background: "#333333",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  } as React.CSSProperties;

  return (
    <div className={isAuthRoute ? "" : "erp-content"}>
      {showNavbar && (
        <nav
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: "20px",
            marginBottom: "0",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            borderBottom: "3px solid #000000ff",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                color: "#000000ff",
                margin: 0,
                fontSize: "26px",
                fontWeight: "700",
                marginRight: "16px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              🚚 ERP Logística
            </h1>

            <Link to="/listar-pedidos-ventas" style={buttonStyle}>
              🔍 Ver Pedidos
            </Link>
            <Link to="/listar-ordenes-compra" style={buttonStyle}>
              📦 Ver OC
            </Link>

            <div
              style={{
                width: "2px",
                height: "24px",
                background: "rgba(0, 0, 0, 0.3)",
                margin: "0 4px",
              }}
            />

            <Link to="/procesar-automatico" style={buttonStyle}>
              🤖 Procesar
            </Link>

            <div
              style={{
                width: "2px",
                height: "24px",
                background: "rgba(0, 0, 0, 0.3)",
                margin: "0 4px",
              }}
            />

            <Link to="/listar-picking" style={buttonStyle}>
              📊 Listar OT
            </Link>
            <Link to="/listar-guias" style={buttonStyle}>
              📋 Listar Guías
            </Link>
          </div>
        </nav>
      )}

      <main style={{ padding: isAuthRoute ? "0" : "32px 20px" }}>
        <Routes>
          <Route path="/auth" element={<Login />} />
          <Route path="/" element={<ProtectedRoute element={<Home />} />} />
          <Route path="*" element={<ProtectedRoute element={<Home />} />} />

          {/* Rutas de Logística - Requieren permiso puedeVerLogistica */}
          <Route
            path="/listar-pedidos-ventas"
            element={
              <ProtectedRoute
                element={<ListarPedidosVentas />}
                requiredPermission="puedeVerLogistica"
              />
            }
          />
          <Route
            path="/listar-ordenes-compra"
            element={
              <ProtectedRoute
                element={<ListarOrdenesCompra />}
                requiredPermission="puedeVerLogistica"
              />
            }
          />
          <Route
            path="/procesar-automatico"
            element={
              <ProtectedRoute
                element={<ProcesarPedidoAutomatico />}
                requiredPermission="puedeVerLogistica"
              />
            }
          />
          <Route
            path="/listar-picking"
            element={
              <ProtectedRoute
                element={<ListarOrdenesPicking />}
                requiredPermission="puedeVerLogistica"
              />
            }
          />
          <Route
            path="/listar-guias"
            element={
              <ProtectedRoute
                element={<ListarGuiasDespacho />}
                requiredPermission="puedeVerLogistica"
              />
            }
          />

          {/* Rutas de otros módulos */}
          <Route
            path="/inventario"
            element={
              <ProtectedRoute
                element={<InventarioPage />}
                requiredPermission="puedeVerInventario"
              />
            }
          />
          <Route
            path="/ventas"
            element={
              <ProtectedRoute
                element={<VentasPage />}
                requiredPermission="puedeVerVentas"
              />
            }
          />
          <Route
            path="/compras/*"
            element={
              <ProtectedRoute
                element={<ComprasPage />}
                requiredPermission="puedeVerCompras"
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;