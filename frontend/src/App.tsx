import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ListarOrdenesPicking from "./pages/ListarOrdenesPicking";
import ListarGuiasDespacho from "./pages/ListarGuiasDespacho";
import ListarPedidosVentas from "./pages/ListarPedidosVentas";
import ListarOrdenesCompra from "./pages/ListarOrdenesCompra";
import ProcesarPedidoAutomatico from "./pages/ProcesarPedidoAutomatico";
// import EstadisticasBalanceo from "./pages/EstadisticasBalanceo";
import "./App.css";

function App() {
  /* Update button styles */
  const buttonStyle = {
    color: "white",
    textDecoration: "none",
    padding: "10px 20px",
    background: "#333333", // Dark gray background
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  };

  return (
    <BrowserRouter>
      <div className="app">
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

            {/* SECCIÓN: RECIBIR */}
            <Link to="/listar-pedidos-ventas" style={buttonStyle}>
              🔍 Ver Pedidos
            </Link>
            <Link to="/listar-ordenes-compra" style={buttonStyle}>
              📦 Ver OC
            </Link>

            {/* SEPARADOR */}
            <div
              style={{
                width: "2px",
                height: "24px",
                background: "rgba(0, 0, 0, 0.3)",
                margin: "0 4px",
              }}
            ></div>

            {/* SECCIÓN: AUTOMATIZACIÓN */}
            <Link to="/procesar-automatico" style={buttonStyle}>
              🤖 Procesar
            </Link>
            {/* <Link to="/estadisticas" style={buttonStyle}>
              📊 Balanceo
            </Link> */}

            {/* SECCIÓN: PROCESAR MANUAL (creación automática ahora) */}
            {/* Las páginas de creación manual fueron retiradas; use 'Procesar Auto' o listado para gestionar OT/Guías */}

            {/* SEPARADOR */}
            <div
              style={{
                width: "2px",
                height: "24px",
                background: "rgba(0, 0, 0, 0.3)",
                margin: "0 4px",
              }}
            ></div>

            {/* SECCIÓN: CONSULTAR */}
            <Link to="/listar-picking" style={buttonStyle}>
              📊 Listar OT
            </Link>
            <Link to="/listar-guias" style={buttonStyle}>
              📋 Listar Guías
            </Link>
          </div>
        </nav>

        <div style={{ padding: "32px 20px" }}>
          <Routes>
            {/* INTEGRACIÓN - Recibir de otros ERPs */}
            <Route
              path="/listar-pedidos-ventas"
              element={<ListarPedidosVentas />}
            />
            <Route
              path="/listar-ordenes-compra"
              element={<ListarOrdenesCompra />}
            />

            {/* AUTOMATIZACIÓN - Procesamiento automático */}
            <Route
              path="/procesar-automatico"
              element={<ProcesarPedidoAutomatico />}
            />
            {/* <Route path="/estadisticas" element={<EstadisticasBalanceo />} /> */}

            {/* PROCESAR - Crear documentos (rutas manuales removidas) */}
            <Route path="/" element={<ListarOrdenesPicking />} />

            {/* CONSULTAR - Listar documentos */}
            <Route path="/listar-picking" element={<ListarOrdenesPicking />} />
            <Route path="/listar-guias" element={<ListarGuiasDespacho />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
