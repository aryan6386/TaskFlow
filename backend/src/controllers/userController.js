const User = require('../models/User');

// Admin can list all users (for member-add lookup)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('name email role').sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
