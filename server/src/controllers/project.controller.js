import { Project } from '../models/Project.js';
import { Organization } from '../models/Organization.js';

export const ProjectController = {
  async create(req, res, next) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: 'Name required' });
      const project = new Project({
        name,
        description,
        organization: req.user.orgId,
        createdBy: req.user.id,
        members: [req.user.id]
      });
      await project.save();
      res.status(201).json({ project });
    } catch (e) {
      next(e);
    }
  },

  async list(req, res, next) {
    try {
      const projects = await Project.find({ organization: req.user.orgId }).sort({ createdAt: -1 });
      res.json({ projects });
    } catch (e) {
      next(e);
    }
  },

  async addMember(req, res, next) {
    try {
      const { projectId } = req.params;
      const { userId } = req.body;
      const project = await Project.findById(projectId);
      if (!project || project.organization.toString() !== req.user.orgId) {
        return res.status(404).json({ error: 'Project not found' });
      }
      // Only org members can add; keep it simple
      if (!project.members.map(String).includes(userId)) {
        project.members.push(userId);
      }
      await project.save();
      res.json({ project });
    } catch (e) {
      next(e);
    }
  }
};
