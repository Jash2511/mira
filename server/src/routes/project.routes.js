import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, ProjectController.list);
router.post('/', authRequired, ProjectController.create);
router.post('/:projectId/members', authRequired, ProjectController.addMember);

export default router;
