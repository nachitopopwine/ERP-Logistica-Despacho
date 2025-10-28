import React, { useState, useEffect } from 'react';
import { despachoService } from '../services/despachoService';
import { pickingService } from '../services/pickingService';
import { recursosService } from '../services/recursosService';
import type { CreateGuiaDespacho, OrdenPicking, Transportista } from '../types';

const CrearGuiaDespacho: React.FC = () => {
  const [ordenesDisponibles, setOrdenesDisponibles] = useState<OrdenPicking[]>([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenPicking | null>(null);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [direccionAutomatica, setDireccionAutomatica] = useState<string>('');
  
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loadingTransportistas, setLoadingTransportistas] = useState(false);
  
  const [formData, setFormData] = useState<CreateGuiaDespacho>({
    id_ot: 0,
    fecha_despacho: new Date().toISOString().split('T')[0],
    transportista: '',
    direccion_entrega: ''
  });

  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar órdenes de trabajo y transportistas al montar
  useEffect(() => {
    cargarOrdenesDisponibles();
    cargarTransportistas();
  }, []);

  const cargarTransportistas = async () => {
    setLoadingTransportistas(true);
    try {
      const response = await recursosService.listarTransportistas();
      setTransportistas(response.data || []);
    } catch (error) {
      console.error('Error al cargar transportistas:', error);
    } finally {
      setLoadingTransportistas(false);
    }
  };

  const cargarOrdenesDisponibles = async () => {
    setLoadingOrdenes(true);
    try {
      const response = await pickingService.getAll();
      setOrdenesDisponibles(response.data || []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoadingOrdenes(false);
    }
  };

  const handleOrdenChange = (otId: string) => {
    console.log('🔄 Orden seleccionada ID:', otId);
    
    if (!otId) {
      setOrdenSeleccionada(null);
      setDireccionAutomatica('');
      setFormData({ ...formData, id_ot: 0, direccion_entrega: '' });
      return;
    }
    
    const orden = ordenesDisponibles.find(o => o.id_ot === Number(otId));
    console.log('📦 Orden encontrada:', orden);
    
    if (orden) {
      setOrdenSeleccionada(orden);
      
      if (orden.observaciones) {
        console.log('📝 Observaciones de la OT:', orden.observaciones);
        
        // Extraer dirección de las observaciones (formato: "Pedido: XXX | Cliente: XXX | Dirección: XXX")
        const direccionMatch = orden.observaciones.match(/Dirección:\s*(.+?)(?:\||$)/);
        console.log('🔍 Match de dirección:', direccionMatch);
        
        if (direccionMatch && direccionMatch[1]) {
          const direccion = direccionMatch[1].trim();
          console.log('✅ Dirección extraída:', direccion);
          setDireccionAutomatica(direccion);
          setFormData({ 
            ...formData, 
            id_ot: Number(otId),
            direccion_entrega: direccion 
          });
        } else {
          console.log('⚠️ No se pudo extraer dirección del formato esperado');
          setFormData({ ...formData, id_ot: Number(otId) });
        }
      } else {
        console.log('⚠️ La OT no tiene observaciones');
        setFormData({ ...formData, id_ot: Number(otId) });
      }
    } else {
      console.log('❌ No se encontró la orden con ID:', otId);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'id_ot' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    try {
      const response = await despachoService.create(formData);
      
      if (response.success) {
        setMensaje({ 
          tipo: 'success', 
          texto: `✅ Guía de Despacho creada exitosamente! ID: ${response.data?.id_guia}` 
        });
        
        // Limpiar formulario
        setFormData({
          id_ot: 0,
          fecha_despacho: new Date().toISOString().split('T')[0],
          transportista: '',
          direccion_entrega: ''
        });
      } else {
        setMensaje({ 
          tipo: 'error', 
          texto: `❌ Error: ${response.message}` 
        });
      }
    } catch (error: any) {
      console.error('Error al crear guía:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: `❌ Error: ${error.response?.data?.message || error.message || 'No se pudo crear la guía'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>🚚 Crear Guía de Despacho</h1>
      
      {mensaje && (
        <div className={mensaje.tipo === 'success' ? 'message-success' : 'message-error'}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SELECTOR DE ORDEN DE TRABAJO */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)', 
          padding: '20px', 
          borderRadius: '12px',
          border: '2px solid #667eea30'
        }}>
          <label htmlFor="orden" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'block' }}>
            📦 Seleccionar Orden de Trabajo
          </label>
          <select
            id="orden"
            onChange={(e) => handleOrdenChange(e.target.value)}
            disabled={loadingOrdenes}
            style={{ fontSize: '15px' }}
          >
            <option value="">-- Selecciona una OT --</option>
            {ordenesDisponibles.map(orden => (
              <option key={orden.id_ot} value={orden.id_ot}>
                OT #{orden.id_ot} - {orden.estado} - Empleado: {orden.id_empleado}
              </option>
            ))}
          </select>
          
          {ordenSeleccionada && direccionAutomatica && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>📋 Detalles de la OT</h4>
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div><strong>N° OT:</strong> {ordenSeleccionada.id_ot}</div>
                <div><strong>Estado:</strong> {ordenSeleccionada.estado}</div>
                <div><strong>Fecha:</strong> {new Date(ordenSeleccionada.fecha).toLocaleDateString()}</div>
                <div style={{ 
                  background: '#f7fafc', 
                  padding: '10px', 
                  borderRadius: '6px',
                  border: '1px solid #48bb7840'
                }}>
                  <strong>📍 Dirección Auto-llenada:</strong><br/>
                  <span style={{ color: '#2d3748', fontSize: '15px' }}>
                    {direccionAutomatica}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="transportista">
            🚚 Transportista *
          </label>
          <select
            id="transportista"
            name="transportista"
            value={formData.transportista}
            onChange={handleChange}
            required
            disabled={loadingTransportistas}
            style={{ fontSize: '15px' }}
          >
            <option value="">-- Selecciona un transportista --</option>
            {transportistas.map(trans => (
              <option key={trans.id} value={trans.nombre}>
                {trans.nombre} - {trans.telefono}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fecha_despacho">
            Fecha de Despacho *
          </label>
          <input
            type="date"
            id="fecha_despacho"
            name="fecha_despacho"
            value={formData.fecha_despacho}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="direccion_entrega">
            Dirección de Entrega *
          </label>
          <input
            type="text"
            id="direccion_entrega"
            name="direccion_entrega"
            value={formData.direccion_entrega}
            onChange={handleChange}
            required
            maxLength={255}
            placeholder="Se auto-llenará al seleccionar una OT"
            readOnly={!!direccionAutomatica}
            style={{ 
              backgroundColor: direccionAutomatica ? '#f0fdf4' : 'white',
              border: direccionAutomatica ? '2px solid #48bb78' : '2px solid #e2e8f0'
            }}
          />
          {direccionAutomatica && (
            <small style={{ color: '#48bb78', fontSize: '13px', display: 'block', marginTop: '6px' }}>
              ✅ Dirección obtenida automáticamente del pedido asociado
            </small>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '⏳ Creando guía...' : '✨ Crear Guía de Despacho'}
        </button>
      </form>

      <div className="help-box">
        <h3>💡 Información de Ayuda</h3>
        <ul>
          <li><strong>Selecciona una OT:</strong> La dirección se auto-llenará desde el pedido asociado</li>
          <li><strong>Dirección Automática:</strong> No necesitas escribir la dirección manualmente ✨</li>
          <li><strong>Transportista:</strong> Ingresa el nombre de la empresa de transporte</li>
          <li>Una vez creada, podrás ver la guía en "📋 Listar Guías"</li>
        </ul>
      </div>
    </div>
  );
};

export default CrearGuiaDespacho;
