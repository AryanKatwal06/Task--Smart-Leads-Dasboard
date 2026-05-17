import { Schema, model, Document } from 'mongoose';

interface IAuditLog extends Document {
  action: string;
  userId?: string;
  userRole?: string;
  resource: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true, index: true },
    userId: { type: String },
    userRole: { type: String },
    resource: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export const AuditLogModel = model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLogModel;
