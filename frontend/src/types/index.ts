// Tipos para Orden de Picking
export interface OrdenPicking {
  id_ot: number;
  id_empleado: number;
  nombre_empleado?: string;
  fecha: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
  observaciones?: string;
}

export interface CreateOrdenPicking {
  id_empleado: number;
  fecha: string;
  estado?: string;
  observaciones?: string;
}

// Tipos para Guía de Despacho
export interface GuiaDespacho {
  id_guia: number;
  id_ot: number;
  fecha: string;
  transportista: string;
  direccion_entrega: string;
  estado_ot?: string;
}

export interface CreateGuiaDespacho {
  id_ot: number;
  fecha_despacho: string;
  transportista: string;
  direccion_entrega: string;
}

// Tipos para respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}
