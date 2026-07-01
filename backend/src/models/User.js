import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Prevents password from being returned in query results by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// Helper method to compare passwords (used during login)
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Since 'password' is select: false, this.password will only be populated 
  // if explicitly selected in the query (which we do during login)
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
