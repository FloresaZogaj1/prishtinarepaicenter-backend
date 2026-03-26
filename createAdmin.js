// Krijo admin-in direkt nga script-i (vetëm për testim)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const username = 'admin';
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  try {
    const exists = await User.findOne({ username });
    if (exists) {
      console.log('Admin ekziston!');
    } else {
      await User.create({ username, password: hash, role: 'admin' });
      console.log('Admin u krijua me sukses! Username: admin / Password: admin123');
    }
  } catch (err) {
    console.error('Gabim:', err);
  }
  mongoose.disconnect();
}

createAdmin();
