import { useState } from 'react';
import { pickingService } from '../services/pickingService';
import type { CreateOrdenPicking } from '../types';

export default function CrearOrdenPicking() {
  const [formData, setFormData] = useState<CreateOrdenPicking>({
    id_empleado: 1,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'PENDIENTE',
    observaciones: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        <div>
          <label htmlFor="id_empleado">
            ID Empleado *
          </label>
          <input
            type="number"
            id="id_empleado"
            value={formData.id_empleado}
            onChange={(e) => setFormData({ ...formData, id_empleado: Number(e.target.value) })}
            required
            min="1"
            max="12"
            placeholder="Ingresa el ID del empleado (1-12)"
          />
          <small style={{ color: '#718096', fontSize: '13px', display: 'block', marginTop: '6px' }}>
            💡 IDs disponibles: 1 al 12
          </small>
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
