import React, { useState, useEffect } from "react";
import { despachoService } from "../services/despachoService";
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import AlertMessage from '../components/common/AlertMessage';
import Badge from '../components/common/Badge';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import SelectField from '../components/common/SelectField';
import StatsCard from '../components/common/StatsCard';
import type { GuiaDespacho } from "../types";

const ListarGuiasDespacho: React.FC = () => {
  const [guias, setGuias] = useState<GuiaDespacho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [ordenamiento, setOrdenamiento] = useState<"fecha_desc" | "fecha_asc" | "id_desc" | "id_asc">("id_desc");

  useEffect(() => { cargarGuias(); }, []);

  const cargarGuias = async () => {
    try {
      setLoading(true);
      const response = await despachoService.getAll();
      if (response.success && response.data) setGuias(response.data);
      else setError("No se pudieron cargar las guías");
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const contarPorEstado = (estado: string) => guias.filter(g => g.estado_ot === estado).length;

  const guiasFiltradas = React.useMemo(() => {
    let resultado = [...guias];
    
    if (busqueda.trim()) {
      const lower = busqueda.toLowerCase();
      resultado = resultado.filter(g =>
        g.id_guia.toString().includes(lower) ||
        g.id_ot.toString().includes(lower) ||
        g.transportista.toLowerCase().includes(lower) ||
        g.direccion_entrega?.toLowerCase().includes(lower)
      );
    }

    if (filtroEstado !== "TODOS") resultado = resultado.filter(g => g.estado_ot === filtroEstado);

    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case "fecha_desc": return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        case "fecha_asc": return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        case "id_desc": return b.id_guia - a.id_guia;
        case "id_asc": return a.id_guia - b.id_guia;
        default: return 0;
      }
    });

    return resultado;
  }, [guias, busqueda, filtroEstado, ordenamiento]);

  const getEstadoVariant = (estado?: string): 'pendiente' | 'proceso' | 'completado' | 'cancelado' | 'enviado' => {
    if (!estado) return 'pendiente';
    if (estado === 'Pendiente' || estado === 'PENDIENTE') return 'pendiente';
    if (estado === 'En proceso' || estado === 'EN_PROCESO') return 'proceso';
    if (estado === 'Completado' || estado === 'COMPLETADA') return 'completado';
    if (estado === 'Enviado') return 'enviado';
    return 'cancelado';
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("TODOS");
    setOrdenamiento("id_desc");
  };

  if (loading) return <div className="list-container"><LoadingSpinner message="Cargando guías de despacho..." size="large" /></div>;

  if (error) {
    return (
      <div className="list-container">
        <AlertMessage type="error" message={error} onClose={() => setError(null)} />
        <EmptyState icon="❌" title="Error al cargar guías" description={error} actionLabel="🔄 Reintentar" onAction={cargarGuias} />
      </div>
    );
  }

  return (
    <div className="list-container">
      <PageHeader 
        title="Guías de Despacho"
        subtitle={`${guias.length} guías registradas`}
        icon="🚚"
        actions={<Button onClick={cargarGuias} icon="🔄" variant="secondary">Actualizar</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatsCard title="Pendientes" value={contarPorEstado('Pendiente')} icon="⏳" color="yellow" subtitle="Por despachar" />
        <StatsCard title="En Proceso" value={contarPorEstado('En proceso')} icon="🔄" color="blue" subtitle="En ruta" />
        <StatsCard title="Completadas" value={contarPorEstado('Completado')} icon="✅" color="green" subtitle="Entregadas" />
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '2px solid #e2e8f0' }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: '16px' }}>
          <SearchBar value={busqueda} onChange={setBusqueda} placeholder="ID guía, OT, transportista, dirección..." />
          <SelectField label="" name="estado" value={filtroEstado} onChange={setFiltroEstado} options={[
            { value: 'TODOS', label: `📋 Todos (${guias.length})` },
            { value: 'Pendiente', label: `⏳ Pendiente (${contarPorEstado('Pendiente')})` },
            { value: 'En proceso', label: `🔄 En proceso (${contarPorEstado('En proceso')})` },
            { value: 'Completado', label: `✅ Completado (${contarPorEstado('Completado')})` }
          ]} />
          <SelectField label="" name="orden" value={ordenamiento} onChange={(v) => setOrdenamiento(v as typeof ordenamiento)} options={[
            { value: 'id_desc', label: '🔢 ID: Mayor a menor' },
            { value: 'id_asc', label: '🔢 ID: Menor a mayor' },
            { value: 'fecha_desc', label: '📅 Fecha: Reciente' },
            { value: 'fecha_asc', label: '📅 Fecha: Antiguo' }
          ]} />
        </div>
        {(busqueda || filtroEstado !== "TODOS" || ordenamiento !== "id_desc") && (
          <Button onClick={limpiarFiltros} variant="ghost" size="small" icon="🗑️">Limpiar filtros</Button>
        )}
      </div>

      {guiasFiltradas.length === 0 ? (
        <EmptyState icon="🚚" title="No hay guías" description="No se encontraron guías con los filtros aplicados" actionLabel="🗑️ Limpiar filtros" onAction={limpiarFiltros} />
      ) : (
        <>
          <p style={{ color: '#64748b', marginBottom: '16px' }}>📈 Mostrando {guiasFiltradas.length} de {guias.length} guías</p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>ID Guía</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>ID OT</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>Fecha</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>Transportista</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700' }}>Dirección</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700' }}>Estado OT</th>
                </tr>
              </thead>
              <tbody>
                {guiasFiltradas.map((guia) => (
                  <tr key={guia.id_guia} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#667eea' }}>Guía #{guia.id_guia}</td>
                    <td style={{ padding: '16px', color: '#334155' }}>OT #{guia.id_ot}</td>
                    <td style={{ padding: '16px', color: '#334155' }}>{new Date(guia.fecha).toLocaleDateString('es-CL')}</td>
                    <td style={{ padding: '16px', color: '#334155' }}>🚛 {guia.transportista}</td>
                    <td style={{ padding: '16px', color: '#4a5568', maxWidth: '250px' }}>
                      {guia.direccion_entrega ? (
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          📍 {guia.direccion_entrega}
                        </div>
                      ) : (
                        <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>Sin dirección</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {guia.estado_ot ? (
                        <Badge variant={getEstadoVariant(guia.estado_ot)}>{guia.estado_ot}</Badge>
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
