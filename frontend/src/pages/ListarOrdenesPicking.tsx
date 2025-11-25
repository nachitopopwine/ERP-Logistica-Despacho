import React, { useState, useEffect } from "react";
import { pickingService } from "../services/pickingService";
import recursosService from "../services/recursosService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import AlertMessage from "../components/common/AlertMessage";
import Badge from "../components/common/Badge";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import SearchBar from "../components/common/SearchBar";
import SelectField from "../components/common/SelectField";
import StatsCard from "../components/common/StatsCard";
import type { OrdenPicking } from "../types";

const ListarOrdenesPicking: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenPicking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [ordenamiento, setOrdenamiento] = useState<
    "fecha_desc" | "fecha_asc" | "id_desc" | "id_asc"
  >("id_desc");
  const [editMode, setEditMode] = useState(false);
  const [rowChanges, setRowChanges] = useState<
    Record<number, Partial<OrdenPicking>>
  >({});
  const [empleadosLogistica, setEmpleadosLogistica] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarOrdenes();
  }, []);

  // Load empleados de logística when entering edit mode
  useEffect(() => {
    if (editMode) {
      recursosService
        .listarEmpleados()
        .then((r) => {
          if (r && (r as any).data) {
            const list = (r as any).data.filter(
              (e: any) => e.rol === "EMPLEADO_LOGISTICA"
            );
            setEmpleadosLogistica(list);
          }
        })
        .catch(() => {});
    }
  }, [editMode]);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const response = await pickingService.getAll();
      if (response.success && response.data) setOrdenes(response.data);
      else setError("No se pudieron cargar las órdenes");
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const contarPorEstado = (estado: string) =>
    ordenes.filter((o) => o.estado === estado).length;

  const ordenesFiltradas = React.useMemo(() => {
    let resultado = [...ordenes];

    if (busqueda.trim()) {
      const lower = busqueda.toLowerCase();
      resultado = resultado.filter(
        (o) =>
          o.id_ot.toString().includes(lower) ||
          o.id_empleado.toString().includes(lower) ||
          o.nombre_empleado?.toLowerCase().includes(lower) ||
          o.observaciones?.toLowerCase().includes(lower)
      );
    }

    if (filtroEstado !== "TODOS")
      resultado = resultado.filter((o) => o.estado === filtroEstado);

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

    return resultado;
  }, [ordenes, busqueda, filtroEstado, ordenamiento]);

  const getEstadoVariant = (
    estado: string
  ): "pendiente" | "proceso" | "completado" | "cancelado" => {
    if (estado === "Pendiente") return "pendiente";
    if (estado === "En proceso") return "proceso";
    if (estado === "Completado") return "completado";
    return "cancelado";
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("TODOS");
    setOrdenamiento("id_desc");
  };

  if (loading)
    return (
      <div className="list-container">
        <LoadingSpinner message="Cargando órdenes..." size="large" />
      </div>
    );

  const hasChanges = Object.keys(rowChanges).length > 0;

  const onRowChange = (id_ot: number, changes: Partial<OrdenPicking>) => {
    setRowChanges((prev) => ({
      ...prev,
      [id_ot]: { ...prev[id_ot], ...changes },
    }));
  };

  const guardarCambios = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      const ids = Object.keys(rowChanges).map(Number);
      for (const id of ids) {
        const body: any = {};
        const changes = rowChanges[id];
        if (changes.fecha) body.fecha = changes.fecha;
        if ((changes as any).id_empleado)
          body.id_empleado = (changes as any).id_empleado;
        if (changes.observaciones !== undefined)
          body.observaciones = changes.observaciones;

        const orden = ordenes.find((o) => o.id_ot === id);
        if (body.fecha && orden?.fecha) {
          if (new Date(body.fecha) < new Date(orden.fecha)) {
            throw new Error(
              `La fecha para OT #${id} no puede ser menor que la fecha registrada`
            );
          }
        }

        await pickingService.update(id, body);
      }
      await cargarOrdenes();
      setRowChanges({});
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || "Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="list-container">
        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
        <EmptyState
          icon="❌"
          title="Error al cargar órdenes"
          description={error}
          actionLabel="🔄 Reintentar"
          onAction={cargarOrdenes}
        />
      </div>
    );
  }

  return (
    <div className="list-container">
      <PageHeader
        title="Órdenes de Trabajo de Picking"
        subtitle={`${ordenes.length} órdenes registradas`}
        icon="📊"
        actions={
          <>
            <Button onClick={cargarOrdenes} icon="🔄" variant="secondary">
              Actualizar
            </Button>
            <Button
              onClick={() => {
                setEditMode((v) => !v);
                if (editMode) setRowChanges({});
              }}
              variant={editMode ? "ghost" : "primary"}
            >
              {editMode ? "Cancelar" : "Editar"}
            </Button>
            {editMode && (
              <Button
                onClick={guardarCambios}
                disabled={!hasChanges || saving}
                icon="💾"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            )}
          </>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatsCard
          title="Pendientes"
          value={contarPorEstado("Pendiente")}
          icon="⏳"
          color="yellow"
          subtitle="Por procesar"
        />
        <StatsCard
          title="En Proceso"
          value={contarPorEstado("En proceso")}
          icon="🔄"
          color="blue"
          subtitle="Activas"
        />
        <StatsCard
          title="Completadas"
          value={contarPorEstado("Completado")}
          icon="✅"
          color="green"
          subtitle="Finalizadas"
        />
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "2px solid #e2e8f0",
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
          <SearchBar
            value={busqueda}
            onChange={setBusqueda}
            placeholder="ID, empleado, observaciones..."
          />
          <SelectField
            label=""
            name="estado"
            value={filtroEstado}
            onChange={setFiltroEstado}
            options={[
              { value: "TODOS", label: `📋 Todos (${ordenes.length})` },
              {
                value: "Pendiente",
                label: `⏳ Pendiente (${contarPorEstado("Pendiente")})`,
              },
              {
                value: "En proceso",
                label: `🔄 En proceso (${contarPorEstado("En proceso")})`,
              },
              {
                value: "Completado",
                label: `✅ Completado (${contarPorEstado("Completado")})`,
              },
            ]}
          />
          <SelectField
            label=""
            name="orden"
            value={ordenamiento}
            onChange={(v) => setOrdenamiento(v as typeof ordenamiento)}
            options={[
              { value: "id_desc", label: "🔢 ID: Mayor a menor" },
              { value: "id_asc", label: "🔢 ID: Menor a mayor" },
              { value: "fecha_desc", label: "📅 Fecha: Reciente" },
              { value: "fecha_asc", label: "📅 Fecha: Antiguo" },
            ]}
          />
        </div>
        {(busqueda ||
          filtroEstado !== "TODOS" ||
          ordenamiento !== "id_desc") && (
          <Button
            onClick={limpiarFiltros}
            variant="ghost"
            size="small"
            icon="🗑️"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {ordenesFiltradas.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No hay órdenes"
          description="No se encontraron órdenes con los filtros aplicados"
          actionLabel="🗑️ Limpiar filtros"
          onAction={limpiarFiltros}
        />
      ) : (
        <>
          <p style={{ color: "#64748b", marginBottom: "16px" }}>
            📈 Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes
          </p>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontWeight: "700",
                    }}
                  >
                    ID OT
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontWeight: "700",
                    }}
                  >
                    Fecha
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontWeight: "700",
                    }}
                  >
                    Empleado
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontWeight: "700",
                    }}
                  >
                    Estado
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontWeight: "700",
                    }}
                  >
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.map((orden) => (
                  <tr
                    key={orden.id_ot}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    <td
                      style={{
                        padding: "16px",
                        fontWeight: "600",
                        color: "#667eea",
                      }}
                    >
                      OT #{orden.id_ot}
                    </td>
                    <td style={{ padding: "16px", color: "#334155" }}>
                      {editMode ? (
                        <input
                          type="date"
                          value={
                            rowChanges[orden.id_ot]?.fecha ??
                            (orden.fecha
                              ? new Date(orden.fecha).toISOString().slice(0, 10)
                              : "")
                          }
                          onChange={(e) =>
                            onRowChange(orden.id_ot, { fecha: e.target.value })
                          }
                          min={
                            orden.fecha
                              ? new Date(orden.fecha).toISOString().slice(0, 10)
                              : undefined
                          }
                        />
                      ) : (
                        new Date(orden.fecha).toLocaleDateString("es-CL")
                      )}
                    </td>
                    <td style={{ padding: "16px", color: "#334155" }}>
                      {editMode ? (
                        <select
                          value={
                            (rowChanges[orden.id_ot] as any)?.id_empleado ??
                            orden.id_empleado ??
                            ""
                          }
                          onChange={(e) =>
                            onRowChange(orden.id_ot, {
                              id_empleado: Number(e.target.value),
                            } as any)
                          }
                        >
                          <option value="">-- Seleccionar --</option>
                          {empleadosLogistica.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.nombre} {emp.apellido}
                            </option>
                          ))}
                        </select>
                      ) : (
                        orden.nombre_empleado || `ID: ${orden.id_empleado}`
                      )}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <Badge variant={getEstadoVariant(orden.estado)}>
                        {orden.estado}
                      </Badge>
                    </td>
                    <td
                      style={{
                        padding: "16px",
                        color: "#4a5568",
                        maxWidth: "300px",
                      }}
                    >
                      {editMode ? (
                        <input
                          type="text"
                          value={
                            rowChanges[orden.id_ot]?.observaciones ??
                            orden.observaciones ??
                            ""
                          }
                          onChange={(e) =>
                            onRowChange(orden.id_ot, {
                              observaciones: e.target.value,
                            })
                          }
                        />
                      ) : (
                        orden.observaciones || (
                          <span
                            style={{ color: "#a0aec0", fontStyle: "italic" }}
                          >
                            Sin observaciones
                          </span>
                        )
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
