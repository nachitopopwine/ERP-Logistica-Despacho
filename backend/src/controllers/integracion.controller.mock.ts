import { Request, Response } from 'express';

/**
 * Controlador MOCK para endpoints de integración
 * ⚠️ USA SOLO DATOS DE PRUEBA - No modifica la BD compartida
 */

// DATOS DE PRUEBA MOCK - PEDIDOS DE VENTAS
const PEDIDOS_MOCK = [
  {
    id: 1,
    numero_pedido: 'PV-2025-001',
    cliente: 'Empresa Demo S.A.',
    direccion_despacho: 'Av. Angamos 0610, Antofagasta',
    estado: 'PENDIENTE',
    fecha_pedido: '2025-10-28T10:00:00.000Z',
    fecha_recepcion: '2025-10-28T10:00:00.000Z',
    observaciones: 'Pedido de prueba 1',
    cantidad_productos: 3
  },
  {
    id: 2,
    numero_pedido: 'PV-2025-002',
    cliente: 'Constructora Norte Ltda.',
    direccion_despacho: 'Calle Prat 456, Calama',
    estado: 'PENDIENTE',
    fecha_pedido: '2025-10-27T14:30:00.000Z',
    fecha_recepcion: '2025-10-27T14:30:00.000Z',
    observaciones: 'Urgente - entrega antes del viernes',
    cantidad_productos: 5
  },
  {
    id: 3,
    numero_pedido: 'PV-2025-003',
    cliente: 'Minera Atacama Corp.',
    direccion_despacho: 'Ruta 5 Norte Km 1340, María Elena',
    estado: 'PROCESADO',
    fecha_pedido: '2025-10-26T09:00:00.000Z',
    fecha_recepcion: '2025-10-26T09:00:00.000Z',
    observaciones: null,
    cantidad_productos: 10
  }
];

// DATOS DE PRUEBA MOCK - ÓRDENES DE COMPRA
const ORDENES_COMPRA_MOCK = [
  {
    id: 1,
    numero_orden: 'OC-2025-001',
    proveedor: 'Distribuidora Tech SpA',
    estado: 'PENDIENTE',
    fecha_orden: '2025-10-28T08:00:00.000Z',
    fecha_recepcion: '2025-10-28T08:00:00.000Z',
    fecha_esperada_entrega: '2025-11-05T00:00:00.000Z',
    observaciones: 'Material de oficina',
    cantidad_productos: 8
  },
  {
    id: 2,
    numero_orden: 'OC-2025-002',
    proveedor: 'Importadora Global Ltda.',
    estado: 'PENDIENTE',
    fecha_orden: '2025-10-27T11:00:00.000Z',
    fecha_recepcion: '2025-10-27T11:00:00.000Z',
    fecha_esperada_entrega: '2025-11-10T00:00:00.000Z',
    observaciones: null,
    cantidad_productos: 15
  },
  {
    id: 3,
    numero_orden: 'OC-2025-003',
    proveedor: 'Suministros Industriales S.A.',
    estado: 'RECEPCIONADA',
    fecha_orden: '2025-10-25T10:00:00.000Z',
    fecha_recepcion: '2025-10-25T10:00:00.000Z',
    fecha_esperada_entrega: '2025-10-30T00:00:00.000Z',
    observaciones: 'Entregado completo',
    cantidad_productos: 20
  }
];

// DATOS DE PRUEBA MOCK - EMPLEADOS
const EMPLEADOS_MOCK = [
  { id: 1, nombre: 'Felipe', apellido: 'Quiroz', rol: 'ADMIN', email: 'felipe@empresa.com', telefono: '153965985' },
  { id: 2, nombre: 'Luis', apellido: 'Fernández', rol: 'JEFE_DEPARTAMENTO', email: 'luis@empresa.com', telefono: '321321321' },
  { id: 3, nombre: 'María', apellido: 'Rodríguez', rol: 'EMPLEADO_GENERAL', email: 'maria@empresa.com', telefono: '654654654' },
  { id: 4, nombre: 'José', apellido: 'Pérez', rol: 'SUPERVISOR_RRHH', email: 'jose@empresa.com', telefono: '987987987' },
  { id: 5, nombre: 'Carlos', apellido: 'González', rol: 'EMPLEADO', email: 'carlos@empresa.com', telefono: '456789123' }
];

// DATOS DE PRUEBA MOCK - TRANSPORTISTAS
const TRANSPORTISTAS_MOCK = [
  { id: 1, nombre: 'Transportes Rápidos S.A.', rut: '76123456-7', telefono: '+56912345678', email: 'contacto@rapidos.cl' },
  { id: 2, nombre: 'LogiExpress Ltda.', rut: '77234567-8', telefono: '+56923456789', email: 'info@logiexpress.cl' },
  { id: 3, nombre: 'Cargo Norte', rut: '78345678-9', telefono: '+56934567890', email: 'ventas@cargonorte.cl' },
  { id: 4, nombre: 'Transportes del Sur', rut: '79456789-0', telefono: '+56945678901', email: 'contacto@delsur.cl' },
  { id: 5, nombre: 'Express Delivery', rut: '80567890-1', telefono: '+56956789012', email: 'info@express.cl' }
];

// ==================== PEDIDOS DE VENTAS ====================

export const listarPedidosVentas = async (_req: Request, res: Response) => {
  try {
    console.log('📥 [MOCK] Listando pedidos de ventas - Total:', PEDIDOS_MOCK.length);
    res.json({
      success: true,
      data: PEDIDOS_MOCK,
      total: PEDIDOS_MOCK.length
    });
  } catch (error) {
    console.error('Error al listar pedidos de ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos de ventas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const obtenerPedidoVenta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pedido = PEDIDOS_MOCK.find(p => p.id === Number(id));
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido de venta no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Error al obtener pedido de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedido de venta',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const recibirPedidoVenta = async (req: Request, res: Response) => {
  try {
    const nuevoPedido = {
      id: PEDIDOS_MOCK.length + 1,
      ...req.body,
      fecha_recepcion: new Date().toISOString(),
      estado: 'PENDIENTE'
    };
    
    PEDIDOS_MOCK.push(nuevoPedido);
    
    res.status(201).json({
      success: true,
      message: 'Pedido de venta recibido correctamente (MOCK)',
      data: nuevoPedido
    });
  } catch (error) {
    console.error('Error al recibir pedido de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recibir pedido de venta',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// ==================== ÓRDENES DE COMPRA ====================

export const listarOrdenesCompra = async (_req: Request, res: Response) => {
  try {
    console.log('📦 [MOCK] Listando órdenes de compra - Total:', ORDENES_COMPRA_MOCK.length);
    res.json({
      success: true,
      data: ORDENES_COMPRA_MOCK,
      total: ORDENES_COMPRA_MOCK.length
    });
  } catch (error) {
    console.error('Error al listar órdenes de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const obtenerOrdenCompra = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orden = ORDENES_COMPRA_MOCK.find(o => o.id === Number(id));
    
    if (!orden) {
      return res.status(404).json({
        success: false,
        message: 'Orden de compra no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: orden
    });
  } catch (error) {
    console.error('Error al obtener orden de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener orden de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const recibirOrdenCompra = async (req: Request, res: Response) => {
  try {
    const nuevaOrden = {
      id: ORDENES_COMPRA_MOCK.length + 1,
      ...req.body,
      fecha_recepcion: new Date().toISOString(),
      estado: 'PENDIENTE'
    };
    
    ORDENES_COMPRA_MOCK.push(nuevaOrden);
    
    res.status(201).json({
      success: true,
      message: 'Orden de compra recibida correctamente (MOCK)',
      data: nuevaOrden
    });
  } catch (error) {
    console.error('Error al recibir orden de compra:', error);
    res.status(500).json({
      success: false,
      message: 'Error al recibir orden de compra',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// ==================== RECURSOS ====================

export const listarEmpleados = async (_req: Request, res: Response) => {
  try {
    console.log('👥 [MOCK] Listando empleados - Total:', EMPLEADOS_MOCK.length);
    res.json({
      success: true,
      data: EMPLEADOS_MOCK
    });
  } catch (error) {
    console.error('Error al listar empleados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener empleados',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const listarTransportistas = async (_req: Request, res: Response) => {
  try {
    console.log('🚚 [MOCK] Listando transportistas - Total:', TRANSPORTISTAS_MOCK.length);
    res.json({
      success: true,
      data: TRANSPORTISTAS_MOCK
    });
  } catch (error) {
    console.error('Error al listar transportistas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener transportistas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
