import React, { useState, useEffect } from 'react';
import { despachoService } from '../services/despachoService';
import type { GuiaDespacho } from '../types';

const ListarGuiasDespacho: React.FC = () => {
  const [guias, setGuias] = useState<GuiaDespacho[]>([]);
  const [guiasFiltradas, setGuiasFiltradas] = useState<GuiaDespacho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [ordenamiento, setOrdenamiento] = useState<'fecha_desc' | 'fecha_asc' | 'id_desc' | 'id_asc'>('id_desc');

  useEffect(() => {
    cargarGuias();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [guias, busqueda, filtroEstado, ordenamiento]);

  const cargarGuias = async () => {
    try {
      setLoading(true);
      const response = await despachoService.getAll();
      
      if (response.success && response.data) {
        setGuias(response.data);
      } else {
        setError('No se pudieron cargar las guías');
      }
    } catch (err: any) {
      console.error('Error al cargar guías:', err);
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...guias];

    // Filtro por búsqueda (ID guía, ID OT, transportista, dirección)
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(guia => 
        guia.id_guia.toString().includes(busquedaLower) ||
        guia.id_ot.toString().includes(busquedaLower) ||
        guia.transportista.toLowerCase().includes(busquedaLower) ||
        (guia.direccion_entrega && guia.direccion_entrega.toLowerCase().includes(busquedaLower))
      );
    }

    // Filtro por estado de OT
    if (filtroEstado !== 'TODOS') {
      resultado = resultado.filter(guia => guia.estado_ot === filtroEstado);
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case 'fecha_desc':
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        case 'fecha_asc':
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        case 'id_desc':
          return b.id_guia - a.id_guia;
        case 'id_asc':
          return a.id_guia - b.id_guia;
        default:
          return 0;
      }
    });

    setGuiasFiltradas(resultado);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroEstado('TODOS');
    setOrdenamiento('id_desc');
  };

  const getEstadoBadge = (estado?: string) => {
    if (!estado) return 'badge';
    
    const clases: { [key: string]: string } = {
      'PENDIENTE': 'badge badge-pendiente',
      'EN_PROCESO': 'badge badge-proceso',
      'COMPLETADA': 'badge badge-completada',
      'CANCELADA': 'badge badge-cancelada',
    };
    return clases[estado] || 'badge';
  };

  const contarPorEstado = (estado: string) => {
    return guias.filter(g => g.estado_ot === estado).length;
  };

  if (loading) {
    return (
      <div className="list-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2 style={{ color: '#667eea' }}>⏳ Cargando guías de despacho...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>❌ Error: {error}</h2>
          <button onClick={cargarGuias} className="btn-refresh">
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h1>📋 Guías de Despacho</h1>
        <button onClick={cargarGuias} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      {/* Panel de Filtros */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          {/* Búsqueda */}
          <div>
            <label htmlFor="busqueda" style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#4a5568',
              fontSize: '14px'
            }}>
              🔍 Buscar
            </label>
            <input
              type="text"
              id="busqueda"
              placeholder="ID guía, OT, transportista, dirección..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Filtro por Estado de OT */}
          <div>
            <label htmlFor="filtroEstado" style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#4a5568',
              fontSize: '14px'
            }}>
              📋 Estado de OT
            </label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="TODOS">Todos ({guias.length})</option>
              <option value="PENDIENTE">⏳ Pendiente ({contarPorEstado('PENDIENTE')})</option>
              <option value="EN_PROCESO">🔄 En Proceso ({contarPorEstado('EN_PROCESO')})</option>
              <option value="COMPLETADA">✅ Completada ({contarPorEstado('COMPLETADA')})</option>
              <option value="CANCELADA">❌ Cancelada ({contarPorEstado('CANCELADA')})</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label htmlFor="ordenamiento" style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#4a5568',
              fontSize: '14px'
            }}>
              ↕️ Ordenar por
            </label>
            <select
              id="ordenamiento"
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="id_desc">ID Guía (Mayor a Menor)</option>
              <option value="id_asc">ID Guía (Menor a Mayor)</option>
              <option value="fecha_desc">Fecha (Más Reciente)</option>
              <option value="fecha_asc">Fecha (Más Antigua)</option>
            </select>
          </div>
        </div>

        {/* Botón Limpiar Filtros */}
        {(busqueda || filtroEstado !== 'TODOS' || ordenamiento !== 'id_desc') && (
          <button
            onClick={limpiarFiltros}
            style={{
              padding: '8px 16px',
              background: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#cbd5e0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#e2e8f0'}
          >
            🗑️ Limpiar Filtros
          </button>
        )}
      </div>

      {guias.length === 0 ? (
        <div className="empty-state">
          <h3>No hay guías de despacho registradas</h3>
          <p>Crea una nueva guía desde el formulario "🚚 Crear Guía"</p>
        </div>
      ) : guiasFiltradas.length === 0 ? (
        <div className="empty-state">
          <h3>No se encontraron resultados</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
          <button onClick={limpiarFiltros} style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <>
          <div className="info-box">
            <strong>
              📦 Mostrando {guiasFiltradas.length} de {guias.length} guías
            </strong>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>ID GUÍA</th>
                  <th style={{ width: '100px' }}>OT</th>
                  <th style={{ width: '140px' }}>FECHA</th>
                  <th>TRANSPORTISTA</th>
                  <th>DIRECCIÓN</th>
                  <th style={{ width: '150px' }}>ESTADO OT</th>
                </tr>
              </thead>
              <tbody>
                {guiasFiltradas.map((guia) => (
                  <tr key={guia.id_guia}>
                    <td style={{ fontWeight: 'bold', color: '#667eea', fontSize: '16px' }}>
                      #{guia.id_guia}
                    </td>
                    <td style={{ fontWeight: 'bold', color: '#764ba2', fontSize: '15px' }}>
                      OT #{guia.id_ot}
                    </td>
                    <td style={{ color: '#4a5568' }}>
                      {new Date(guia.fecha).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={{ color: '#2d3748', fontWeight: '500' }}>
                      {guia.transportista}
                    </td>
                    <td style={{ maxWidth: '250px', color: '#4a5568' }}>
                      {guia.direccion_entrega || (
                        <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>
                          No especificada
                        </span>
                      )}
                    </td>
                    <td>
                      {guia.estado_ot ? (
                        <span className={getEstadoBadge(guia.estado_ot)}>
                          {guia.estado_ot}
                        </span>
                      ) : (
                        <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>N/A</span>
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

export default ListarGuiasDespacho;
