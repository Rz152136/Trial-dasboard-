// api/me.js
const { requireUser } = require('../lib/auth');

module.exports = async (req, res) => {
  try {
    const user = await requireUser(req);
    
    // User sudah terverifikasi, kirim data profile
    return res.status(200).json({
      id: user.id,
      email: user.email,
      fullName: user.full_name || user.email,
      role: user.role || 'tamu',
    });
  } catch (err) {
    return res.status(err.status || 401).json({ error: err.message });
  }
};
