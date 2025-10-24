import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';

export const TaskController = {
  async create(req, res, next) {
    try {
      const { projectId, title, description, assignedTo } = req.body;
      if (!projectId || !title) return res.status(400).json({ error: 'projectId and title required' });

      const project = await Project.findById(projectId);
      if (!project || project.organization.toString() !== req.user.orgId) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const task = new Task({
        title,
        description,
        project: project._id,
        organization: req.user.orgId,
        assignedTo: assignedTo || null,
        createdBy: req.user.id
      });
      await task.save();
      res.status(201).json({ task });
    } catch (e) {
      next(e);
    }
  },

  async listByProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const tasks = await Task.find({ project: projectId, organization: req.user.orgId }).sort({ createdAt: -1 });
      res.json({ tasks });
    } catch (e) {
      next(e);
    }
  },

  async assign(req, res, next) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const task = await Task.findById(id);
      if (!task || task.organization.toString() !== req.user.orgId) return res.status(404).json({ error: 'Task not found' });
      task.assignedTo = userId || null;
      await task.save();
      res.json({ task });
    } catch (e) {
      next(e);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['todo', 'in-progress', 'done'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
      const task = await Task.findById(id);
      if (!task || task.organization.toString() !== req.user.orgId) return res.status(404).json({ error: 'Task not found' });
      task.status = status;
      await task.save();
      res.json({ task });
    } catch (e) {
      next(e);
    }
  },

  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const task = await Task.findById(id);
      if (!task || task.organization.toString() !== req.user.orgId) return res.status(404).json({ error: 'Task not found' });
      await task.deleteOne();
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
};
