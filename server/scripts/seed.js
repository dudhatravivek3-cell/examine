const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/examine_export';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding...');

    // Check if admin user already exists
    const userExists = await User.findOne({ username: 'admin' });

    if (userExists) {
      console.log('Admin user already exists.');
    } else {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'adminpassword' // Hashed by schema's pre-save middleware
      });

      await adminUser.save();
      console.log('Default Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: adminpassword');
    }

    await mongoose.disconnect();
    console.log('MongoDB disconnected. Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
