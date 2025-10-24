import { Organization } from '../models/Organization.js';
import { User } from '../models/User.js';

export const OrganizationController = {
  async create(req, res, next) {
    try {
      const { name, inviteEmails } = req.body;
      if (!name) return res.status(400).json({ error: 'Name required' });
      const existing = await Organization.findOne({ name: name.trim() });
      if (existing) return res.status(400).json({ error: 'Organization already exists' });

      // Creator must be authenticated; becomes owner
      const org = new Organization({ name: name.trim(), invites: (inviteEmails || []).map(e => e.toLowerCase()) });

      // Update current user to owner within this org
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      org.owner = user._id;
      org.members.push({ user: user._id, role: 'owner' });

      // move the user to this org if different (edge-case: creating org after initial signup)
      user.organization = org._id;
      user.role = 'owner';
      user.status = 'active';

      await org.save();
      await user.save();

      res.status(201).json({ organization: org });
    } catch (e) {
      next(e);
    }
  },

  async myOrganizations(req, res, next) {
    try {
      const userId = req.user.id;
      const orgs = await Organization.find({ 'members.user': userId });
      res.json({ organizations: orgs });
    } catch (e) {
      next(e);
    }
  },

  async invite(req, res, next) {
    try {
      const { orgId } = req.params;
      const { emails } = req.body; // array of emails
      const org = await Organization.findById(orgId);
      if (!org) return res.status(404).json({ error: 'Organization not found' });

      // Only owners can invite
      if (req.user.role !== 'owner' || req.user.orgId !== org._id.toString()) {
        return res.status(403).json({ error: 'Only owners can invite in this organization' });
      }

      const toAdd = (emails || []).map((e) => e.toLowerCase()).filter(Boolean);
      const existingInvites = new Set((org.invites || []).map((e) => e.toLowerCase()));
      toAdd.forEach((e) => existingInvites.add(e));
      org.invites = Array.from(existingInvites);
      await org.save();
      res.json({ organization: org });
    } catch (e) {
      next(e);
    }
  },

  async members(req, res, next) {
    try {
      const { orgId } = req.params;
      if (req.user.orgId !== orgId) return res.status(403).json({ error: 'Forbidden' });
      const org = await Organization.findById(orgId).populate({ path: 'members.user', select: 'name email' });
      if (!org) return res.status(404).json({ error: 'Organization not found' });
      const members = (org.members || []).map((m) => ({
        _id: m.user?._id,
        name: m.user?.name,
        email: m.user?.email,
        role: m.role
      }));
      res.json({ members });
    } catch (e) {
      next(e);
    }
  }
};
