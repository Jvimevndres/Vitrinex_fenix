import mongoose from 'mongoose';

const chatbotUsageSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messageType: {
    type: String,
    enum: ['free', 'premium'],
    required: true
  },
  promptTokens: {
    type: Number,
    default: 0
  },
  completionTokens: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    required: true
  },
  estimatedCost: {
    type: Number,
    required: true // En USD
  },
  model: {
    type: String,
    default: 'gpt-4o-mini'
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Índices para consultas rápidas
chatbotUsageSchema.index({ storeId: 1, createdAt: -1 });
chatbotUsageSchema.index({ userId: 1, createdAt: -1 });
chatbotUsageSchema.index({ createdAt: -1 });

export default mongoose.model('ChatbotUsage', chatbotUsageSchema);
