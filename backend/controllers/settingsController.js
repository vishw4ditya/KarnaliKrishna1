import Settings from '../models/Settings.js';

// @desc    Get website settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update website settings
// @route   PUT /api/settings
// @access  Private (Super Admin)
export const updateSettings = async (req, res) => {
  const { 
    siteName, 
    contactEmail, 
    contactPhone, 
    address, 
    vatRate, 
    shippingCharge, 
    maintenanceMode,
    fonepayMerchantCode,
    fonepayStoreCode,
    fonepaySecretKey
  } = req.body;

  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    settings.siteName = siteName || settings.siteName;
    settings.contactEmail = contactEmail || settings.contactEmail;
    settings.contactPhone = contactPhone || settings.contactPhone;
    settings.address = address || settings.address;
    settings.vatRate = vatRate !== undefined ? Number(vatRate) : settings.vatRate;
    settings.shippingCharge = shippingCharge !== undefined ? Number(shippingCharge) : settings.shippingCharge;
    settings.maintenanceMode = maintenanceMode !== undefined ? maintenanceMode : settings.maintenanceMode;
    settings.fonepayMerchantCode = fonepayMerchantCode !== undefined ? fonepayMerchantCode : settings.fonepayMerchantCode;
    settings.fonepayStoreCode = fonepayStoreCode !== undefined ? fonepayStoreCode : settings.fonepayStoreCode;
    settings.fonepaySecretKey = fonepaySecretKey !== undefined ? fonepaySecretKey : settings.fonepaySecretKey;

    const updatedSettings = await settings.save();
    res.json({ success: true, settings: updatedSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
