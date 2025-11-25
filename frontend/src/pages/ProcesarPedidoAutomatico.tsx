import React, { useState, useEffect } from "react";
import { integracionService } from "../services/integracionService";
import { automatizacionService } from "../services/automatizacionService";
import AlertMessage from "../components/common/AlertMessage";
import EmptyState from "../components/common/EmptyState";
import PedidoCard from "../components/pedidos/PedidoCard";
import ResultadoProcesamiento from "../components/pedidos/ResultadoProcesamiento";
import type { PedidoVenta } from "../types";

const ProcesarPedidoAutomatico: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoVenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "success" | "error";
    texto: string;
  } | null>(null);
  const [resultado, setResultado] = useState<any | null>(null);
  const [editingOt, setEditingOt] = useState(false);
  const [editingGuia, setEditingGuia] = useState(false);
  const [editOtEmpleadoId, setEditOtEmpleadoId] = useState<number | "">("");
  const [editGuiaTransportista, setEditGuiaTransportista] = useState("");
  const [editGuiaFecha, setEditGuiaFecha] = useState("");
  const [editGuiaDireccion, setEditGuiaDireccion] = useState("");

  useEffect(() => {
    cargarPedidosPendientes();
  }, []);

  const cargarPedidosPendientes = async () => {
    try {
      const response = await integracionService.listarPedidosVentas();
      if (response.success && response.data) {
        // Filtrar solo pedidos pendientes
        const pendientes = response.data.filter(
          (p: PedidoVenta) => p.estado === "PENDIENTE"
        );
        setPedidos(pendientes);
      }
    } catch (error: any) {
      console.error("Error al cargar pedidos:", error);
    }
  };

  const procesarPedido = async (idVenta: number) => {
    try {
      setLoading(true);
      setMensaje(null);
      setResultado(null);

      console.log("🤖 Procesando pedido automáticamente...", idVenta);

      const response = await automatizacionService.procesarPedido({
        id_venta: idVenta,
      });

      if (response.success) {
        setMensaje({
          tipo: "success",
          texto: "¡Pedido procesado automáticamente!",
        });
        setResultado(response.data);

        // Recargar lista de pedidos
        setTimeout(() => {
          cargarPedidosPendientes();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error al procesar pedido:", error);
      setMensaje({
        tipo: "error",
        texto: error.response?.data?.message || "Error al procesar el pedido",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarOt = async () => {
    if (!resultado?.orden_trabajo?.id_ot) return;
    if (!editOtEmpleadoId)
      return setMensaje({ tipo: "error", texto: "Ingrese id de empleado" });
    try {
      setLoading(true);
      const res = await automatizacionService.editarOt(
        resultado.orden_trabajo.id_ot,
        { id_empleado: Number(editOtEmpleadoId) }
      );
      if (res.success) {
        setMensaje({ tipo: "success", texto: "OT actualizada" });
        // reflect change locally
        setResultado((r: any) => ({
          ...r,
          orden_trabajo: {
            ...r.orden_trabajo,
            empleado: `Empleado ${editOtEmpleadoId}`,
          },
        }));
        setEditingOt(false);
      }
    } catch (error: any) {
      setMensaje({
        tipo: "error",
        texto: error.response?.data?.message || "Error al actualizar OT",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarGuia = async () => {
    if (!resultado?.guia_despacho?.id_guia) return;
    try {
      setLoading(true);
      const body: any = {};
      if (editGuiaTransportista) body.transportista = editGuiaTransportista;
      if (editGuiaFecha) body.fecha = editGuiaFecha;
      if (editGuiaDireccion) body.direccion_entrega = editGuiaDireccion;
      const res = await automatizacionService.editarGuia(
        resultado.guia_despacho.id_guia,
        body
      );
      if (res.success) {
        setMensaje({ tipo: "success", texto: "Guía actualizada" });
        setResultado((r: any) => ({
          ...r,
          guia_despacho: {
            ...r.guia_despacho,
            transportista:
              editGuiaTransportista || r.guia_despacho.transportista,
            fecha: editGuiaFecha || r.guia_despacho.fecha,
            direccion: editGuiaDireccion || r.guia_despacho.direccion,
          },
        }));
        setEditingGuia(false);
      }
    } catch (error: any) {
      setMensaje({
        tipo: "error",
        texto: error.response?.data?.message || "Error al actualizar Guía",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>🤖 Procesamiento Automático de Pedidos</h1>
        <p style={{ marginTop: "10px", color: "#667eea" }}>
          Sistema automatizado de asignación y despacho
        </p>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <AlertMessage
          type={mensaje.tipo}
          message={mensaje.texto}
          onClose={() => setMensaje(null)}
        />
      )}

      {/* Resultado del procesamiento */}
      {resultado && (
        <ResultadoProcesamiento
          resultado={resultado}
          onClose={() => setResultado(null)}
        />
      )}

      {/* Editar OT / Guía (inline) */}
      {resultado && (
        <div
          style={{
            marginTop: 12,
            border: "1px solid #eee",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <h3>Resultados rápidos</h3>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div>
              <strong>OT:</strong> #{resultado.orden_trabajo.id_ot} —{" "}
              {resultado.orden_trabajo.empleado}
            </div>
            <button
              onClick={() => setEditingOt((s) => !s)}
              aria-label="Editar OT"
            >
              {editingOt ? "Cancelar" : "Editar OT"}
            </button>
          </div>
          {editingOt && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <input
                type="number"
                placeholder="Nuevo id_empleado"
                value={editOtEmpleadoId as any}
                onChange={(e) =>
                  setEditOtEmpleadoId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              />
              <button onClick={handleEditarOt} disabled={loading}>
                Guardar OT
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div>
              <strong>Guía:</strong> #{resultado.guia_despacho.id_guia} —{" "}
              {resultado.guia_despacho.transportista}
            </div>
            <button
              onClick={() => setEditingGuia((s) => !s)}
              aria-label="Editar Guía"
            >
              {editingGuia ? "Cancelar" : "Editar Guía"}
            </button>
          </div>
          {editingGuia && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <input
                type="text"
                placeholder="Transportista"
                value={editGuiaTransportista}
                onChange={(e) => setEditGuiaTransportista(e.target.value)}
              />
              <input
                type="datetime-local"
                placeholder="Fecha"
                value={editGuiaFecha}
                onChange={(e) => setEditGuiaFecha(e.target.value)}
              />
              <input
                type="text"
                placeholder="Dirección"
                value={editGuiaDireccion}
                onChange={(e) => setEditGuiaDireccion(e.target.value)}
              />
              <button onClick={handleEditarGuia} disabled={loading}>
                Guardar Guía
              </button>
            </div>
          )}
        </div>
      )}

      {/* Información del sistema */}
      <div className="info-box" style={{ marginBottom: "20px" }}>
        <h3>🔄 Flujo Automático</h3>
        <ol style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li>Selecciona un pedido pendiente</li>
          <li>
            Sistema asigna empleado con <strong>balanceo de carga</strong>
          </li>
          <li>Crea Orden de Trabajo automáticamente</li>
          <li>
            Asigna transportista con <strong>balanceo de carga</strong>
          </li>
          <li>Crea Guía de Despacho automáticamente</li>
          <li>⚠️ Notificar a módulo de Ventas (manual por ahora)</li>
        </ol>
      </div>

      {/* Lista de pedidos pendientes */}
      <div>
        <h2 style={{ marginBottom: "15px" }}>
          📋 Pedidos Pendientes ({pedidos.length})
        </h2>

        {pedidos.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No hay pedidos pendientes"
            description="Todos los pedidos han sido procesados"
            actionLabel="🔄 Recargar"
            onAction={cargarPedidosPendientes}
          />
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onAction={() => procesarPedido(pedido.id)}
                actionLabel={loading ? "⏳ Procesando..." : "🤖 Procesar"}
                actionDisabled={loading}
                showDetails={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcesarPedidoAutomatico;
