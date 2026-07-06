import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'Nepal Bazaar E-Commerce',
    },
    contactEmail: {
      type: String,
      default: 'info@nepalbazaar.com',
    },
    contactPhone: {
      type: String,
      default: '+977-1-4444444',
    },
    address: {
      type: String,
      default: 'Kathmandu, Nepal',
    },
    vatRate: {
      type: Number,
      default: 13, // 13% VAT in Nepal
    },
    shippingCharge: {
      type: Number,
      default: 100, // 100 Rs Delivery Charge
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    fonepayMerchantCode: {
      type: String,
      default: '',
    },
    fonepayStoreCode: {
      type: String,
      default: '',
    },
    fonepaySecretKey: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
