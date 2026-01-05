import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    department: { type: String, default: '' },
    graduationYear: { type: Number, default: new Date().getFullYear() },
    studentId: { type: String, unique: true, sparse: true },
    profilePhoto: { type: String, default: '' },
    quote: { type: String, default: '' },
    bio: { type: String, default: '' },
    rememberMeFor: { type: String, default: '' },
    hobbies: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    phoneNumber: { type: String, default: '' },
    telegram: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    isActivated: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
