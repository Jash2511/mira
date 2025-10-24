import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member' }
  },
  { _id: false }
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [memberSchema],
    invites: [{ type: String, lowercase: true }]
  },
  { timestamps: true }
);

export const Organization = mongoose.model('Organization', organizationSchema);
