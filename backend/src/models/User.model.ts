import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IAudioFile {
  id: string
  name: string
  url: string
  md5?: string
  uploadedAt: Date
}

export interface IUser extends Document {
  email: string
  username: string
  password: string
  avatar?: string
  membershipType: 'free' | 'premium' | 'vip'
  credits: number
  uploadedAudio: IAudioFile[]
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
    },
    membershipType: {
      type: String,
      enum: ['free', 'premium', 'vip'],
      default: 'free',
    },
    credits: {
      type: Number,
      default: 100,
    },
    uploadedAudio: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          url: { type: String, required: true },
          md5: { type: String },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)

