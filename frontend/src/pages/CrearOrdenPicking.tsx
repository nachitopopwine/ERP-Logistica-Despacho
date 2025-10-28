import { useState, useEffect } from 'react';
import { pickingService } from '../services/pickingService';
import { integracionService } from '../services/integracionService';
import { recursosService } from '../services/recursosService';
import type { CreateOrdenPicking, PedidoVenta, Empleado } from '../types';

export default function CrearOrdenPicking() {
  const [pedidosDisponibles, setPedidosDisponibles] = useState<PedidoVenta[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoVenta | null>(null);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  
  const [formData, setFormData] = useState<CreateOrdenPicking>({
    id_empleado: 0,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'PENDIENTE',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar pedidos pendientes y empleados al montar el componente
  useEffect(() => {
    cargarPedidosPendientes();
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    setLoadingEmpleados(true);
    try {
      const response = await recursosService.listarEmpleados();
      setEmpleados(response.data || []);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const cargarPedidosPendientes = async () => {
    setLoadingPedidos(true);
    try {
      const response = await integracionService.listarPedidosVentas();
      const pedidos = response.data || [];
      // Filtrar solo pedidos pendientes
      const pedidosPendientes = pedidos.filter((p: PedidoVenta) => p.estado === 'PENDIENTE');
      setPedidosDisponibles(pedidosPendientes);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handlePedidoChange = (pedidoId: string) => {
    if (!pedidoId) {
      setPedidoSeleccionado(null);
      return;
    }
    
    const pedido = pedidosDisponibles.find(p => p.id === Number(pedidoId));
    if (pedido) {
      setPedidoSeleccionado(pedido);
      // Auto-llenar observaciones con info del pedido
      setFormData({
        ...formData,
        observaciones: `Pedido: ${pedido.numero_pedido} | Cliente: ${pedido.cliente} | Dirección: ${pedido.direccion_despacho}`
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await pickingService.create(formData);
      
      if (response.success) {
        setMessage({ type: 'success', text: '✅ Orden de Picking creada exitosamente!' });
        // Limpiar formulario
        setFormData({
          id_empleado: 1,
          fecha: new Date().toISOString().split('T')[0],
          estado: 'PENDIENTE',
          observaciones: '',
        });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: `❌ Error: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>📦 Crear Orden de Trabajo de Picking</h1>
      
      {message && (
        <div className={message.type === 'success' ? 'message-success' : 'message-error'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SELECTOR DE PEDIDO */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', 
          padding: '20px', 
          borderRadius: '12px',
          border: '2px solid #667eea30'
        }}>
          <label htmlFor="pedido" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'block' }}>
            📦 Seleccionar Pedido de Venta
          </label>
          <select
            id="pedido"
            onChange={(e) => handlePedidoChange(e.target.value)}
            disabled={loadingPedidos}
            style={{ fontSize: '15px' }}
          >
            <option value="">-- Selecciona un pedido pendiente --</option>
            {pedidosDisponibles.map(pedido => (
              <option key={pedido.id} value={pedido.id}>
                {pedido.numero_pedido} - {pedido.cliente} - {pedido.direccion_despacho}
              </option>
            ))}
          </select>
          
          {pedidoSeleccionado && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>📋 Detalles del Pedido</h4>
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div><strong>N° Pedido:</strong> {pedidoSeleccionado.numero_pedido}</div>
                <div><strong>Cliente:</strong> {pedidoSeleccionado.cliente}</div>
                <div style={{ 
                  background: '#f7fafc', 
                  padding: '10px', 
                  borderRadius: '6px',
                  border: '1px solid #667eea40'
                }}>
                  <strong>📍 Dirección de Despacho:</strong><br/>
                  <span style={{ color: '#2d3748', fontSize: '15px' }}>
                    {pedidoSeleccionado.direccion_despacho}
                  </span>
                </div>
                <div><strong>Fecha Pedido:</strong> {new Date(pedidoSeleccionado.fecha_pedido).toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="id_empleado">
            👤 Empleado Responsable *
          </label>
          <select
            id="id_empleado"
            value={formData.id_empleado || ''}
            onChange={(e) => setFormData({ ...formData, id_empleado: Number(e.target.value) })}
            required
            disabled={loadingEmpleados}
            style={{ fontSize: '15px' }}
          >
            <option value="">-- Selecciona un empleado --</option>
            {empleados.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre} {emp.apellido} - {emp.rol}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fecha">
            Fecha de la Orden *
          </label>
          <input
            type="date"
            id="fecha"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="estado">
            Estado Inicial *
          </label>
          <select
            id="estado"
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
          >
            <option value="PENDIENTE">⏳ Pendiente</option>
            <option value="EN_PROCESO">🔄 En Proceso</option>
            <option value="COMPLETADA">✅ Completada</option>
            <option value="CANCELADA">❌ Cancelada</option>
          </select>
        </div>

        <div>
          <label htmlFor="observaciones">
            Observaciones
          </label>
          <textarea
            id="observaciones"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            rows={4}
            placeholder="Agrega notas o comentarios sobre esta orden de picking..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '⏳ Creando orden...' : '✨ Crear Orden de Picking'}
        </button>
      </form>

      <div className="help-box">
        <h3>💡 Información de Ayuda</h3>
        <ul>
          <li><strong>ID Empleado:</strong> Debe ser un empleado existente en el sistema (1-12)</li>
          <li><strong>Estado:</strong> Normalmente inicia como "Pendiente"</li>
          <li><strong>Observaciones:</strong> Campo opcional para notas adicionales</li>
          <li>Una vez creada, podrás ver la orden en "📊 Listar OT"</li>
        </ul>
      </div>
    </div>
  );
}
