// src/models/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true, minlength: 6 },

    // Rol del usuario (para panel de administrador)
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Datos extra del usuario
    rut: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },

    bio: { type: String, trim: true, default: '' },

    // Foto de perfil
    avatarUrl: { type: String, trim: true, default: '' },

    // Campos User Persona
    title: { type: String, trim: true, default: '' },
    quote: { type: String, trim: true, default: '' },
    age: { type: Number },
    status: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    archetype: { type: String, trim: true, default: '' },
    rating: { type: Number, default: 0 },

    // Personalidad (valores 0-100)
    personality: {
      introvert: { type: Number, default: 50 },
      analytical: { type: Number, default: 50 },
      loyal: { type: Number, default: 50 },
      passive: { type: Number, default: 50 },
    },

    // Motivaciones (valores 0-100)
    motivations: {
      price: { type: Number, default: 50 },
      comfort: { type: Number, default: 50 },
      convenience: { type: Number, default: 50 },
      speed: { type: Number, default: 50 },
      transparency: { type: Number, default: 50 },
    },

    // Arrays para User Persona
    goals: [{ type: String }],
    frustrations: [{ type: String }],
    favoriteBrands: [
      {
        name: { type: String },
        logo: { type: String },
      },
    ],
    archetypes: [{ type: String }],

    // Estadísticas del usuario
    stats: {
      projects: { type: Number, default: 0 },
      businesses: { type: Number, default: 0 },
      responseRate: { type: Number, default: 0 },
    },

    // Personalización visual del perfil (igual idea que la tienda)
    primaryColor: { type: String, trim: true, default: '#2563eb' },
    accentColor: { type: String, trim: true, default: '#0f172a' },

    bgMode: {
      type: String,
      enum: ['gradient', 'solid', 'image'],
      default: 'gradient',
    },
    bgColorTop: { type: String, trim: true, default: '#e8d7ff' },
    bgColorBottom: { type: String, trim: true, default: '#ffffff' },
    bgPattern: {
      type: String,
      enum: ['none', 'dots', 'grid', 'noise'],
      default: 'none',
    },
    bgImageUrl: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  // Solo hashear si la contraseña fue modificada
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
