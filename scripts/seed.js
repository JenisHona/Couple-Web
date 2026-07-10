// This script seeds the database with sample couple data
// Usage: MONGODB_URI=your_uri node scripts/seed.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/couples-journal';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'partner'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('lovestory123', salt);

    // Create couple users
    const user1 = await User.create({
      username: 'couple',
      email: 'couple@lovestory.com',
      password: hashedPassword,
      role: 'user',
    });

    const user2 = await User.create({
      username: 'partner',
      email: 'partner@lovestory.com',
      password: hashedPassword,
      role: 'partner',
    });

    console.log('✅ Created users:');
    console.log(`   - ${user1.username} (${user1.email})`);
    console.log(`   - ${user2.username} (${user2.email})`);
    console.log('\n📝 Login with username: "couple" and password: "lovestory123"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
