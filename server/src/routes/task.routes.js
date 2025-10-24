import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/project/:projectId', authRequired, TaskController.listByProject);
router.post('/', authRequired, TaskController.create);
router.patch('/:id/assign', authRequired, TaskController.assign);
router.patch('/:id/status', authRequired, TaskController.updateStatus);
router.delete('/:id', authRequired, TaskController.remove);

export default router;
