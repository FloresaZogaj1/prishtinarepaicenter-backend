const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema(
  {
    businessInfo: {
      companyName: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      mapsLink: { type: String, default: '' },
      workingHours: { type: String, default: '' },
    },
    websiteSettings: {
      logo: { type: String, default: '' },
      favicon: { type: String, default: '' },
      footerText: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },
    bookingSettings: {
      slotDuration: { type: Number, default: 60 },
      maxBookingsPerDay: { type: Number, default: 20 },
      autoConfirm: { type: Boolean, default: false },
      manualApproval: { type: Boolean, default: true },
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      adminAlerts: { type: Boolean, default: true },
      bookingConfirmationText: { type: String, default: '' },
    },
    seoSettings: {
      defaultMetaTitle: { type: String, default: '' },
      defaultMetaDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', SettingSchema);
