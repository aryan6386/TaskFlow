require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Cleanup
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});

  // Users
  const admin = await User.create({ name: 'Alex Admin', email: 'admin@demo.com', password: 'password123', role: 'admin' });
  const member1 = await User.create({ name: 'Sam Member', email: 'member1@demo.com', password: 'password123', role: 'member' });
  const member2 = await User.create({ name: 'Jordan Dev', email: 'member2@demo.com', password: 'password123', role: 'member' });

  // Projects
  const p1 = await Project.create({ name: 'Website Redesign', description: 'Complete overhaul of the company website with modern UI.', owner: admin._id, members: [admin._id, member1._id, member2._id], status: 'active' });
  const p2 = await Project.create({ name: 'Mobile App v2', description: 'Second major release of the mobile application with new features.', owner: admin._id, members: [admin._id, member1._id], status: 'active' });
  const p3 = await Project.create({ name: 'API Integration', description: 'Integrate third-party payment and analytics APIs.', owner: admin._id, members: [admin._id, member2._id], status: 'on_hold' });

  const past = (d) => { const date = new Date(); date.setDate(date.getDate() - d); return date; };
  const future = (d) => { const date = new Date(); date.setDate(date.getDate() + d); return date; };

  // Tasks for Project 1
  await Task.create([
    { title: 'Design homepage mockup', description: 'Create Figma mockups for the new homepage', project: p1._id, assignee: member1._id, createdBy: admin._id, status: 'completed', priority: 'high', dueDate: past(5) },
    { title: 'Implement navigation bar', description: 'Build responsive navigation', project: p1._id, assignee: member1._id, createdBy: admin._id, status: 'in_progress', priority: 'high', dueDate: future(3) },
    { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated deployment', project: p1._id, assignee: member2._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: future(7) },
    { title: 'Write unit tests', description: 'Add test coverage for core components', project: p1._id, assignee: member2._id, createdBy: admin._id, status: 'todo', priority: 'low', dueDate: past(2) },
    { title: 'SEO optimization', description: 'Add meta tags and improve page scores', project: p1._id, assignee: member1._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: past(1) },
  ]);

  // Tasks for Project 2
  await Task.create([
    { title: 'User authentication flow', description: 'Implement OAuth and JWT in mobile app', project: p2._id, assignee: member1._id, createdBy: admin._id, status: 'completed', priority: 'high', dueDate: past(10) },
    { title: 'Push notification service', description: 'Integrate FCM for push notifications', project: p2._id, assignee: member1._id, createdBy: admin._id, status: 'in_progress', priority: 'high', dueDate: future(5) },
    { title: 'Offline mode support', description: 'Implement local caching with SQLite', project: p2._id, assignee: member1._id, createdBy: admin._id, status: 'todo', priority: 'medium', dueDate: future(14) },
  ]);

  // Tasks for Project 3
  await Task.create([
    { title: 'Stripe payment integration', description: 'Add Stripe checkout for subscriptions', project: p3._id, assignee: member2._id, createdBy: admin._id, status: 'todo', priority: 'high', dueDate: past(3) },
    { title: 'Analytics dashboard setup', description: 'Connect Mixpanel and configure events', project: p3._id, assignee: member2._id, createdBy: admin._id, status: 'in_progress', priority: 'medium', dueDate: future(10) },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('📧 Admin:   admin@demo.com   / password123');
  console.log('📧 Member1: member1@demo.com / password123');
  console.log('📧 Member2: member2@demo.com / password123');
  await mongoose.disconnect();
};

seed().catch((e) => { console.error(e); process.exit(1); });
