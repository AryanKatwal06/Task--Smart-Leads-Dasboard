import { Schema, model, Document } from 'mongoose';
import { LeadStatus, LeadSource } from './lead.model';

export interface ISavedFilter extends Document {
  userId: string;
  name: string;
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'name' | 'email' | 'status' | 'source' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  createdAt: Date;
  updatedAt: Date;
}

const savedFilterSchema = new Schema<ISavedFilter>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    status: { type: String },
    source: { type: String },
    search: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    sortBy: { type: String },
    sortOrder: { type: String }
  },
  { timestamps: true }
);

export const SavedFilterModel = model<ISavedFilter>('SavedFilter', savedFilterSchema);
export default SavedFilterModel;
