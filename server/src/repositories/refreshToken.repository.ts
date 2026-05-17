import { RefreshTokenModel } from '../models/refreshToken.model';
import { Types } from 'mongoose';

export const RefreshTokenRepository = {
  async create(userId: string, hashedToken: string, expiresAt?: Date) {
    return RefreshTokenModel.create({ user: new Types.ObjectId(userId), token: hashedToken, expiresAt });
  },
  async findByUser(userId: string) {
    return RefreshTokenModel.find({ user: new Types.ObjectId(userId), revoked: false }).exec();
  },
  async revoke(id: string) {
    return RefreshTokenModel.findByIdAndUpdate(id, { revoked: true }).exec();
  },
  async delete(id: string) {
    return RefreshTokenModel.findByIdAndDelete(id).exec();
  }
};

export default RefreshTokenRepository;
