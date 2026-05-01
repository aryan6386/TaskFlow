require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');

const unseed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const tasks    = await Task.deleteMany({});
  const projects = await Project.deleteMany({});
  const users    = await User.deleteMany({});

  console.log(`\n🗑  Deleted ${tasks.deletedCount} tasks`);
  console.log(`🗑  Deleted ${projects.deletedCount} projects`);
  console.log(`🗑  Deleted ${users.deletedCount} users`);
  console.log('\n✅ All seed data removed. Database is clean.');

  await mongoose.disconnect();
};

unseed().catch((e) => { console.error(e); process.exit(1); });
