import React, { useState } from 'react';
import { despachoService } from '../services/despachoService';
import type { CreateGuiaDespacho } from '../types';

const CrearGuiaDespacho: React.FC = () => {
  const [formData, setFormData] = useState<CreateGuiaDespacho>({
    id_ot: 0,
    fecha_despacho: new Date().toISOString().split('T')[0],
    transportista: '',
    direccion_entrega: ''
  });

  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);
  const [loading, setLoading] = useState(false);

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
        <div>
          <label htmlFor="id_ot">
            ID Orden de Trabajo (OT) *
          </label>
          <input
            type="number"
            id="id_ot"
            name="id_ot"
            value={formData.id_ot || ''}
            onChange={handleChange}
            required
            min="1"
            placeholder="Ej: 14"
          />
          <small style={{ color: '#718096', fontSize: '13px', display: 'block', marginTop: '6px' }}>
            ⚠️ La OT debe existir en el sistema
          </small>
        </div>

        <div>
          <label htmlFor="transportista">
            Nombre del Transportista *
          </label>
          <input
            type="text"
            id="transportista"
            name="transportista"
            value={formData.transportista}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Ej: Transportes Rápidos S.A."
          />
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
            placeholder="Ej: Av. Libertador 1234, Santiago"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '⏳ Creando guía...' : '✨ Crear Guía de Despacho'}
        </button>
      </form>

      <div className="help-box">
        <h3>💡 Información de Ayuda</h3>
        <ul>
          <li><strong>OT Requerida:</strong> La Orden de Trabajo debe existir previamente (puedes usar la OT #14 que creaste)</li>
          <li><strong>Validación:</strong> Si intentas crear una guía con una OT inexistente (ej: 999), verás un error</li>
          <li><strong>Transportista:</strong> Ingresa el nombre de la empresa de transporte</li>
          <li>Una vez creada, podrás ver la guía en "📋 Listar Guías"</li>
        </ul>
      </div>
    </div>
  );
};

export default CrearGuiaDespacho;
