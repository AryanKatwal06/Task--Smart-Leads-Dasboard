import ApiError from '../utils/ApiError';
import { SavedFilterModel, ISavedFilter } from '../models/savedFilter.model';

export const SavedFilterService = {
  async createFilter(userId: string, data: Partial<ISavedFilter>) {
    const filter = await SavedFilterModel.create({ userId, ...data });
    return filter;
  },

  async getFilters(userId: string) {
    return SavedFilterModel.find({ userId }).sort({ createdAt: -1 }).exec();
  },

  async getFilterById(id: string, userId: string) {
    const filter = await SavedFilterModel.findOne({ _id: id, userId }).exec();
    if (!filter) throw new ApiError(404, 'Saved filter not found');
    return filter;
  },

  async updateFilter(id: string, userId: string, data: Partial<ISavedFilter>) {
    const filter = await SavedFilterModel.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true, runValidators: true }
    ).exec();
    if (!filter) throw new ApiError(404, 'Saved filter not found');
    return filter;
  },

  async deleteFilter(id: string, userId: string) {
    const filter = await SavedFilterModel.findOneAndDelete({ _id: id, userId }).exec();
    if (!filter) throw new ApiError(404, 'Saved filter not found');
    return filter;
  }
};

export default SavedFilterService;
