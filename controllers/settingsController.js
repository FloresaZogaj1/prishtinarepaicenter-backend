const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ message: 'Gabim gjatë marrjes së settings.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    settings.businessInfo = req.body.businessInfo ?? settings.businessInfo;
    settings.websiteSettings = req.body.websiteSettings ?? settings.websiteSettings;
    settings.bookingSettings = req.body.bookingSettings ?? settings.bookingSettings;
    settings.notifications = req.body.notifications ?? settings.notifications;
    settings.seoSettings = req.body.seoSettings ?? settings.seoSettings;

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ message: 'Gabim gjatë ruajtjes së settings.' });
  }
};
