import mongoose from 'mongoose';

const sponsorAdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      trim: true,
      default: '',
    },
    position: {
      type: String,
      enum: ['top', 'sidebarLeft', 'sidebarRight', 'betweenSections', 'footer'],
      required: true,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('SponsorAd', sponsorAdSchema);
