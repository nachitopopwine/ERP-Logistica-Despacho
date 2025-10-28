import { useState, useEffect } from 'react';
import integracionService from '../services/integracionService';
import type { PedidoVenta } from '../types';

export default function ListarPedidosVentas() {
  const [pedidos, setPedidos] = useState<PedidoVenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🚀 [COMPONENTE MONTADO] ListarPedidosVentas v2.0');

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [FETCH] Llamando a integracionService.listarPedidosVentas()...');
      const response = await integracionService.listarPedidosVentas();
      console.log('✅ [FETCH] Respuesta completa:', JSON.stringify(response, null, 2));
      
      if (response && response.success && response.data) {
        console.log('📦 [SUCCESS] Pedidos encontrados:', response.data.length);
        console.log('📦 [DATA]:', response.data);
        setPedidos(response.data);
      } else {
        console.error('❌ [ERROR] Respuesta inválida:', response);
        setError('No se pudieron cargar los pedidos');
      }
    } catch (err: any) {
      console.error('❌ [EXCEPTION] Error completo:', err);
      console.error('❌ [EXCEPTION] Error message:', err.message);
      console.error('❌ [EXCEPTION] Error response:', err.response);
      setError(err.response?.data?.message || err.message || 'Error al cargar pedidos de ventas');
    } finally {
      setLoading(false);
      console.log('✔️ [FINALLY] Carga completada. Loading:', false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      'PENDIENTE': { bg: '#fef3c7', color: '#92400e', emoji: '⏳' },
      'PROCESADO': { bg: '#d1fae5', color: '#065f46', emoji: '✅' },
      'RECHAZADO': { bg: '#fee2e2', color: '#991b1b', emoji: '❌' },
    };
    const estilo = estilos[estado as keyof typeof estilos] || estilos.PENDIENTE;
    
    return (
      <span style={{
        backgroundColor: estilo.bg,
        color: estilo.color,
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        whiteSpace: 'nowrap'
      }}>
        {estilo.emoji} {estado}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="list-container">
        <h1>📥 Pedidos Recibidos desde Ventas</h1>
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          <p>⏳ Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>📥 Pedidos Recibidos desde Ventas</h1>
        <button 
          onClick={cargarPedidos}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #dc2626'
        }}>
          ❌ {error}
        </div>
      )}

      {pedidos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #d1d5db'
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📦</p>
          <p style={{ fontSize: '18px', color: '#374151', fontWeight: '600', margin: '0 0 8px 0' }}>
            No hay pedidos recibidos
          </p>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Los pedidos desde el ERP de Ventas aparecerán aquí automáticamente
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: '#718096', marginBottom: '16px', fontSize: '14px' }}>
            📊 Total de pedidos: <strong>{pedidos.length}</strong>
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>N° Pedido</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Cliente</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Fecha Pedido</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Dirección Despacho</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Estado</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Recibido</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido, index) => (
                  <tr 
                    key={pedido.id}
                    style={{
                      borderBottom: index < pedidos.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.2s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{ padding: '16px', fontWeight: '600', color: '#667eea' }}>
                      {pedido.numero_pedido}
                    </td>
                    <td style={{ padding: '16px', color: '#334155' }}>
                      <div style={{ fontWeight: '500' }}>{pedido.cliente}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#334155' }}>
                      {new Date(pedido.fecha_pedido).toLocaleDateString('es-CL')}
                    </td>
                    <td style={{ padding: '16px', color: '#334155', maxWidth: '250px' }}>
                      <div style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        fontSize: '13px'
                      }}>
                        📍 {pedido.direccion_despacho}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {getEstadoBadge(pedido.estado)}
                    </td>
                    <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
                      {new Date(pedido.fecha_recepcion).toLocaleDateString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="help-box" style={{ marginTop: '24px' }}>
            <h3>💡 Información</h3>
            <ul>
              <li><strong>Pedidos Pendientes:</strong> Esperan ser procesados en una OT de Picking</li>
              <li><strong>Dirección de Despacho:</strong> Viene automáticamente del pedido original</li>
              <li><strong>Procesados:</strong> Ya tienen una OT asociada</li>
              <li>Los pedidos llegan automáticamente desde el ERP de Ventas</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
