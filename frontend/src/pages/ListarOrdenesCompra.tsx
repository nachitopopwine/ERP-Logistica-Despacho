import { useState, useEffect } from 'react';
import integracionService from '../services/integracionService';
import type { OrdenCompra } from '../types';

export default function ListarOrdenesCompra() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Cargando órdenes de compra...');
      const response = await integracionService.listarOrdenesCompra();
      console.log('✅ Respuesta recibida:', response);
      
      if (response.success && response.data) {
        console.log('📦 Órdenes encontradas:', response.data.length);
        setOrdenes(response.data);
      } else {
        console.error('❌ Error en respuesta:', response);
        setError('No se pudieron cargar las órdenes de compra');
      }
    } catch (err: any) {
      console.error('❌ Error capturado:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar órdenes de compra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const getEstadoBadge = (estado: string) => {
    const estilos = {
      'PENDIENTE': { bg: '#fef3c7', color: '#92400e', emoji: '⏳' },
      'RECEPCIONADA': { bg: '#d1fae5', color: '#065f46', emoji: '✅' },
      'RECHAZADA': { bg: '#fee2e2', color: '#991b1b', emoji: '❌' },
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
        <h1>📦 Órdenes de Compra Recibidas</h1>
        <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
          <p>⏳ Cargando órdenes de compra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>📦 Órdenes de Compra Recibidas</h1>
        <button 
          onClick={cargarOrdenes}
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

      {ordenes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #d1d5db'
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📋</p>
          <p style={{ fontSize: '18px', color: '#374151', fontWeight: '600', margin: '0 0 8px 0' }}>
            No hay órdenes de compra recibidas
          </p>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Las OC desde el ERP de Compras aparecerán aquí automáticamente
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: '#718096', marginBottom: '16px', fontSize: '14px' }}>
            📊 Total de órdenes: <strong>{ordenes.length}</strong>
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
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>N° Orden</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Proveedor</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Fecha Orden</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#475569' }}>Estado</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Recibida</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden, index) => (
                  <tr 
                    key={orden.id}
                    style={{
                      borderBottom: index < ordenes.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.2s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{ padding: '16px', fontWeight: '600', color: '#667eea' }}>
                      {orden.numero_orden}
                    </td>
                    <td style={{ padding: '16px', color: '#334155' }}>
                      <div style={{ fontWeight: '500' }}>{orden.proveedor}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#334155' }}>
                      {new Date(orden.fecha_orden).toLocaleDateString('es-CL')}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {getEstadoBadge(orden.estado)}
                    </td>
                    <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>
                      {new Date(orden.fecha_recepcion).toLocaleDateString('es-CL')}
                    </td>
                    <td style={{ padding: '16px', color: '#64748b', fontSize: '13px', maxWidth: '200px' }}>
                      <div style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis'
                      }}>
                        {orden.observaciones || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="help-box" style={{ marginTop: '24px' }}>
            <h3>💡 Información</h3>
            <ul>
              <li><strong>OC Pendientes:</strong> Esperan recepción de mercadería</li>
              <li><strong>Recepcionadas:</strong> La mercadería ya fue registrada en el sistema</li>
              <li><strong>Proceso:</strong> Registrar recepción → Confirmar ingreso a Inventario</li>
              <li>Las órdenes llegan automáticamente desde el ERP de Compras</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
