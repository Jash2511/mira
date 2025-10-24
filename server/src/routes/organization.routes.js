import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/mine', authRequired, OrganizationController.myOrganizations);
router.post('/', authRequired, OrganizationController.create);
router.post('/:orgId/invite', authRequired, OrganizationController.invite);
router.get('/:orgId/members', authRequired, OrganizationController.members);

export default router;
