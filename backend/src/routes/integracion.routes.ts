import { Router } from 'express';
import {
  listarPedidosVentas,
  obtenerPedidoVenta,
  recibirPedidoVenta,
  listarOrdenesCompra,
  obtenerOrdenCompra,
  recibirOrdenCompra
} from '../controllers/integracion.controller';

const router = Router();

// ==================== PEDIDOS DE VENTAS ====================
router.get('/pedidos-ventas', listarPedidosVentas);
router.get('/pedidos-ventas/:id', obtenerPedidoVenta);
router.post('/recibir-pedido-venta', recibirPedidoVenta);

// ==================== ÓRDENES DE COMPRA ====================
router.get('/ordenes-compra', listarOrdenesCompra);
router.get('/ordenes-compra/:id', obtenerOrdenCompra);
router.post('/recibir-orden-compra', recibirOrdenCompra);

export default router;
