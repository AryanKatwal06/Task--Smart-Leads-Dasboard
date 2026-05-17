import { UserModel, IUser } from '../models/user.model';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const UserRepository = {
  async create(user: Partial<IUser>) {
    return UserModel.create(user);
  },
  async findByEmail(email: string) {
    return UserModel.findOne({ email: normalizeEmail(email) }).exec();
  },
  async findById(id: string) {
    return UserModel.findById(id).exec();
  }
  ,
  async count() {
    return UserModel.countDocuments().exec();
  }
};

export default UserRepository;
