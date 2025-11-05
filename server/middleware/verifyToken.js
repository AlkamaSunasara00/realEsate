// middleware/verifyToken.js
const jwt = require('jsonwebtoken');
const connection = require('../connection/connection');
const { ACCESS_TOKEN_SECRET } = require('../utils/jwtUtils');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });

    const { jti, id: adminId } = decoded; // decoded has id & jti & role & status
    connection.query(
      'SELECT * FROM active_tokens WHERE token_id = ? AND admin_id = ? AND is_blacklisted = 0',
      [jti, adminId],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(401).json({ error: 'Token has been invalidated' });

        // Attach full decoded token to req.admin so handlers can access role, status, jti, id, etc.
        req.admin = decoded;
        next();
      }
    );
  });
};

module.exports = verifyToken;
