import { AuditLogModel } from '../models/audit.model';

export const AuditService = {
  async log(action: string, resource: string, userId?: string, userRole?: string, details?: Record<string, unknown>) {
    try {
      await AuditLogModel.create({
        action,
        resource,
        userId,
        userRole,
        details
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to log audit', err);
    }
  },

  async getLogs(resource?: string, limit = 100) {
    const query = resource ? { resource } : {};
    return AuditLogModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
};

export default AuditService;
