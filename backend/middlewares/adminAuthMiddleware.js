const jwt = require('jsonwebtoken');
const Admin = require('../models/admin/Admin');

module.exports = async (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, not an admin' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid or not an admin' });
  }
};
