import { Router } from 'express';
import { listarEmpleados, listarTransportistas } from '../controllers/recursos.controller';

const router = Router();

router.get('/empleados', listarEmpleados);
router.get('/transportistas', listarTransportistas);

export default router;
