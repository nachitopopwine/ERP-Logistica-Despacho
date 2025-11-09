import api from './api';
import type { Empleado, Transportista, ApiResponse } from '../types';

export const recursosService = {
  // Listar empleados activos
  listarEmpleados: async () => {
    console.log('📡 [SERVICE] Llamando GET /recursos/empleados');
    const response = await api.get<ApiResponse<Empleado[]>>('/recursos/empleados');
    console.log('📡 [SERVICE] Empleados recibidos:', response.data);
    return response.data;
  },

  // Listar transportistas activos
  listarTransportistas: async () => {
    console.log('📡 [SERVICE] Llamando GET /recursos/transportistas');
    const response = await api.get<ApiResponse<Transportista[]>>('/recursos/transportistas');
    console.log('📡 [SERVICE] Transportistas recibidos:', response.data);
    return response.data;
  },
};

export default recursosService;
