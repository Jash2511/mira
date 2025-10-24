import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), orgId: user.organization.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export const AuthController = {
  async signup(req, res, next) {
    try {
      const { name, email, password, orgAction, orgId, orgName, inviteEmails } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(400).json({ error: 'Email already in use' });

      if (orgAction === 'create') {
        if (!orgName) return res.status(400).json({ error: 'Organization name required' });
        const taken = await Organization.findOne({ name: orgName.trim() });
        if (taken) return res.status(400).json({ error: 'Organization name already exists' });

        const passwordHash = await bcrypt.hash(password, 10);

        const org = new Organization({ name: orgName.trim(), invites: (inviteEmails || []).map(e => e.toLowerCase()) });
        const user = new User({ name, email: email.toLowerCase(), passwordHash, role: 'owner', organization: org._id, status: 'active' });
        org.owner = user._id;
        org.members.push({ user: user._id, role: 'owner' });
        await org.save();
        await user.save();

        const token = signToken(user);
        return res.status(201).json({ token, user: user.toJSONSafe(), organization: org });
      }

      if (orgAction === 'join') {
        // Must provide existing org selection
        let org = null;
        if (orgId) org = await Organization.findById(orgId);
        if (!org && orgName) org = await Organization.findOne({ name: orgName.trim() });
        if (!org) return res.status(400).json({ error: 'Organization not found; cannot sign up as member' });

        // Only allow if email is invited
        const emailLc = email.toLowerCase();
        const invited = (org.invites || []).map(e => e.toLowerCase());
        if (!invited.includes(emailLc)) {
          return res.status(403).json({ error: 'This email is not invited to the selected organization' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ name, email: emailLc, passwordHash, role: 'member', organization: org._id, status: 'active' });
        await user.save();

        // add to members, remove from invites
        org.members.push({ user: user._id, role: 'member' });
        org.invites = invited.filter((e) => e !== emailLc);
        await org.save();

        const token = signToken(user);
        return res.status(201).json({ token, user: user.toJSONSafe(), organization: org });
      }

      return res.status(400).json({ error: 'Invalid orgAction. Use "create" or "join".' });
    } catch (e) {
      next(e);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password, orgId, orgName } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
      // Require org selection
      if (!orgId && !orgName) return res.status(400).json({ error: 'Organization selection required for login' });

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

      let org = null;
      if (orgId) org = await Organization.findById(orgId);
      if (!org && orgName) org = await Organization.findOne({ name: orgName.trim() });
      if (!org) return res.status(400).json({ error: 'Organization not found' });

      if (user.organization.toString() !== org._id.toString()) {
        return res.status(403).json({ error: 'User does not belong to the selected organization' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ error: 'User is not active' });
      }

      const token = signToken(user);
      return res.json({ token, user: user.toJSONSafe(), organization: org });
    } catch (e) {
      next(e);
    }
  }
};
