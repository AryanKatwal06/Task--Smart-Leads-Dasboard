import { Schema, model, Document } from 'mongoose';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';

export interface ILead extends Document {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Lost'], default: 'New' },
    source: { type: String, enum: ['Website', 'Instagram', 'Referral'], default: 'Website' },
  },
  { timestamps: true }
);

LeadSchema.index({ status: 1, source: 1, createdAt: -1 });
LeadSchema.index({ name: 1 });
LeadSchema.index({ email: 1 });

export const LeadModel = model<ILead>('Lead', LeadSchema);
