import { useState, useEffect } from 'react';
import { pickingService } from '../services/pickingService';
import { integracionService } from '../services/integracionService';
import { recursosService } from '../services/recursosService';
import AlertMessage from '../components/common/AlertMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SelectField from '../components/common/SelectField';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import InfoBox from '../components/common/InfoBox';
import Card from '../components/common/Card';
import PageHeader from '../components/common/PageHeader';
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
      <PageHeader 
        title="Crear Orden de Trabajo de Picking"
        subtitle="Asigna un empleado a un pedido pendiente"
        icon="📦"
      />
      
      {message && (
        <AlertMessage 
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {loading && <LoadingSpinner message="Creando orden de trabajo..." />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SELECTOR DE PEDIDO */}
        <Card 
          title="📦 Seleccionar Pedido de Venta"
          style={{ 
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            border: '2px solid #667eea30'
          }}
        >
          <SelectField
            label=""
            name="pedido"
            value=""
            onChange={handlePedidoChange}
            options={pedidosDisponibles.map(p => ({
              value: p.id,
              label: `${p.numero_pedido} - ${p.cliente} - ${p.direccion_despacho}`
            }))}
            placeholder="-- Selecciona un pedido pendiente --"
            loading={loadingPedidos}
          />
          
          {pedidoSeleccionado && (
            <InfoBox title="📋 Detalles del Pedido" variant="info">
              <div style={{ display: 'grid', gap: '8px' }}>
                <div><strong>N° Pedido:</strong> {pedidoSeleccionado.numero_pedido}</div>
                <div><strong>Cliente:</strong> {pedidoSeleccionado.cliente}</div>
                <div style={{ 
                  background: '#f7fafc', 
                  padding: '10px', 
                  borderRadius: '6px',
                  marginTop: '8px'
                }}>
                  <strong>📍 Dirección de Despacho:</strong><br/>
                  <span style={{ color: '#2d3748', fontSize: '15px' }}>
                    {pedidoSeleccionado.direccion_despacho}
                  </span>
                </div>
                <div><strong>Fecha Pedido:</strong> {new Date(pedidoSeleccionado.fecha_pedido).toLocaleDateString()}</div>
              </div>
            </InfoBox>
          )}
        </Card>

        <SelectField
          label="👤 Empleado Responsable"
          name="id_empleado"
          value={formData.id_empleado || ''}
          onChange={(value) => setFormData({ ...formData, id_empleado: Number(value) })}
          options={empleados.map(e => ({
            value: e.id,
            label: `${e.nombre} ${e.apellido} - ${e.rol}`
          }))}
          placeholder="-- Selecciona un empleado --"
          required
          loading={loadingEmpleados}
        />

        <FormField
          label="📅 Fecha de la Orden"
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={(value) => setFormData({ ...formData, fecha: value })}
          required
        />

        <SelectField
          label="📊 Estado Inicial"
          name="estado"
          value={formData.estado || 'PENDIENTE'}
          onChange={(value) => setFormData({ ...formData, estado: value })}
          options={[
            { value: 'PENDIENTE', label: '⏳ Pendiente' },
            { value: 'EN_PROCESO', label: '🔄 En Proceso' },
            { value: 'COMPLETADA', label: '✅ Completada' },
            { value: 'CANCELADA', label: '❌ Cancelada' }
          ]}
          required
        />

        <FormField
          label="📝 Observaciones"
          type="textarea"
          name="observaciones"
          value={formData.observaciones || ''}
          onChange={(value) => setFormData({ ...formData, observaciones: value })}
          placeholder="Agrega notas o comentarios sobre esta orden de picking..."
          rows={4}
        />

        <Button 
          type="submit" 
          disabled={loading}
          loading={loading}
          icon="✨"
          size="large"
          fullWidth
        >
          Crear Orden de Picking
        </Button>
      </form>

      <InfoBox title="Información de Ayuda" variant="tip">
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Pedido:</strong> Selecciona un pedido pendiente para procesar</li>
          <li><strong>Empleado:</strong> Asigna un empleado responsable del picking</li>
          <li><strong>Estado:</strong> Normalmente inicia como "Pendiente"</li>
          <li><strong>Observaciones:</strong> Se auto-completan con datos del pedido</li>
          <li>Una vez creada, podrás ver la orden en "📊 Listar OT"</li>
        </ul>
      </InfoBox>
    </div>
  );
}
