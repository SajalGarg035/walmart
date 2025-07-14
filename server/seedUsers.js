const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/walmart-app');
    
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'john@example.com' });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const demoUser = new User({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: hashedPassword
      });
      
      await demoUser.save();
      console.log('Demo user created: john@example.com / password123');
    } else {
      console.log('Demo user already exists');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding users:', error);
    mongoose.disconnect();
  }
};

seedUsers();
