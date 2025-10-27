import React, { useState, useEffect } from "react";
import { pickingService } from "../services/pickingService";
import type { OrdenPicking } from "../types";

const ListarOrdenesPicking: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenPicking[]>([]);
  const [ordenesFiltradas, setOrdenesFiltradas] = useState<OrdenPicking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [ordenamiento, setOrdenamiento] = useState<
    "fecha_desc" | "fecha_asc" | "id_desc" | "id_asc"
  >("id_desc");

  useEffect(() => {
    cargarOrdenes();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [ordenes, busqueda, filtroEstado, ordenamiento]);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const response = await pickingService.getAll();

      if (response.success && response.data) {
        setOrdenes(response.data);
      } else {
        setError("No se pudieron cargar las órdenes");
      }
    } catch (err: any) {
      console.error("Error al cargar órdenes:", err);
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...ordenes];

    // Filtro por búsqueda (ID, empleado, observaciones)
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (orden) =>
          orden.id_ot.toString().includes(busquedaLower) ||
          orden.id_empleado.toString().includes(busquedaLower) ||
          (orden.nombre_empleado &&
            orden.nombre_empleado.toLowerCase().includes(busquedaLower)) ||
          (orden.observaciones &&
            orden.observaciones.toLowerCase().includes(busquedaLower))
      );
    }

    // Filtro por estado
    if (filtroEstado !== "TODOS") {
      resultado = resultado.filter((orden) => orden.estado === filtroEstado);
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case "fecha_desc":
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        case "fecha_asc":
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        case "id_desc":
          return b.id_ot - a.id_ot;
        case "id_asc":
          return a.id_ot - b.id_ot;
        default:
          return 0;
      }
    });

    setOrdenesFiltradas(resultado);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("TODOS");
    setOrdenamiento("id_desc");
  };

  const getEstadoBadge = (estado: string) => {
    const clases: { [key: string]: string } = {
      Pendiente: "badge badge-pendiente",
      "En proceso": "badge badge-proceso",
      Completado: "badge badge-completada",
      Cancelado: "badge badge-cancelada",
    };
    return clases[estado] || "badge";
  };

  const contarPorEstado = (estado: string) => {
    return ordenes.filter((o) => o.estado === estado).length;
  };

  if (loading) {
    return (
      <div className="list-container">
        <div style={{ textAlign: "center", padding: "60px" }}>
          <h2 style={{ color: "#667eea" }}>⏳ Cargando órdenes...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-container">
        <div style={{ textAlign: "center", padding: "60px" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "20px" }}>
            ❌ Error: {error}
          </h2>
          <button onClick={cargarOrdenes} className="btn-refresh">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>📊 Órdenes de Trabajo de Picking</h1>
        <button onClick={cargarOrdenes} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      {/* Panel de Filtros */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "2px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Búsqueda */}
          <div>
            <label
              htmlFor="busqueda"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#4a5568",
                fontSize: "14px",
              }}
            >
              🔍 Buscar
            </label>
            <input
              type="text"
              id="busqueda"
              placeholder="ID, empleado, observaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Filtro por Estado */}
          <div>
            <label
              htmlFor="filtroEstado"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#4a5568",
                fontSize: "14px",
              }}
            >
              📋 Estado
            </label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              <option value="TODOS">Todos ({ordenes.length})</option>
              <option value="Pendiente">
                ⏳ Pendiente ({contarPorEstado("Pendiente")})
              </option>
              <option value="En proceso">
                🔄 En Proceso ({contarPorEstado("En proceso")})
              </option>
              <option value="Completado">
                ✅ Completada ({contarPorEstado("Completado")})
              </option>
              <option value="Cancelado">
                ❌ Cancelada ({contarPorEstado("Cancelado")})
              </option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label
              htmlFor="ordenamiento"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#4a5568",
                fontSize: "14px",
              }}
            >
              ↕️ Ordenar por
            </label>
            <select
              id="ordenamiento"
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value as any)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              <option value="id_desc">ID (Mayor a Menor)</option>
              <option value="id_asc">ID (Menor a Mayor)</option>
              <option value="fecha_desc">Fecha (Más Reciente)</option>
              <option value="fecha_asc">Fecha (Más Antigua)</option>
            </select>
          </div>
        </div>

        {/* Botón Limpiar Filtros */}
        {(busqueda ||
          filtroEstado !== "TODOS" ||
          ordenamiento !== "id_desc") && (
          <button
            onClick={limpiarFiltros}
            style={{
              padding: "8px 16px",
              background: "#e2e8f0",
              color: "#4a5568",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#cbd5e0")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#e2e8f0")}
          >
            🗑️ Limpiar Filtros
          </button>
        )}
      </div>

      {ordenes.length === 0 ? (
        <div className="empty-state">
          <h3>No hay órdenes registradas</h3>
          <p>Crea una nueva orden desde el formulario "📝 Crear OT"</p>
        </div>
      ) : ordenesFiltradas.length === 0 ? (
        <div className="empty-state">
          <h3>No se encontraron resultados</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
          <button
            onClick={limpiarFiltros}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <>
          <div className="info-box">
            <strong>
              📈 Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes
            </strong>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>ID OT</th>
                  <th>EMPLEADO</th>
                  <th style={{ width: "140px" }}>FECHA</th>
                  <th style={{ width: "150px" }}>ESTADO</th>
                  <th>OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.map((orden) => (
                  <tr key={orden.id_ot}>
                    <td
                      style={{
                        fontWeight: "bold",
                        color: "#667eea",
                        fontSize: "16px",
                      }}
                    >
                      #{orden.id_ot}
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#2d3748" }}>
                        ID: {orden.id_empleado}
                      </div>
                      {orden.nombre_empleado && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#718096",
                            marginTop: "2px",
                          }}
                        >
                          {orden.nombre_empleado}
                        </div>
                      )}
                    </td>
                    <td style={{ color: "#4a5568" }}>
                      {new Date(orden.fecha).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <span className={getEstadoBadge(orden.estado)}>
                        {orden.estado}
                      </span>
                    </td>
                    <td style={{ maxWidth: "300px", color: "#4a5568" }}>
                      {orden.observaciones || (
                        <span style={{ color: "#a0aec0", fontStyle: "italic" }}>
                          Sin observaciones
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ListarOrdenesPicking;
