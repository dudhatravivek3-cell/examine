const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const resetPasswordCLI = async () => {
  const args = process.argv.slice(2);
  const identifier = args[0];
  const newPassword = args[1];

  if (!identifier || !newPassword) {
    console.log('\nUsage: node scripts/reset-password.js <username_or_email> <new_password>');
    console.log('Example: node scripts/reset-password.js admin newpass123\n');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/examine_export';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');

    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      console.error(`Error: No user found matching '${identifier}'`);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.password = newPassword; // Triggers bcrypt hashing pre-save hook in User model
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log(`\nSuccess! Password for user '${user.username}' (${user.email}) updated successfully.`);
    console.log(`New Password: ${newPassword}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to reset password:', error.message);
    process.exit(1);
  }
};

resetPasswordCLI();
