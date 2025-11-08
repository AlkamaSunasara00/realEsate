const jwt = require('jsonwebtoken');
const connection = require('../connection/connection');
const { ACCESS_TOKEN_SECRET } = require('../utils/jwtUtils');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });

    const { jti, id: adminId } = decoded;

    // Check that token is still valid in DB (not blacklisted)
    connection.query(
      'SELECT * FROM active_tokens WHERE token_id = ? AND admin_id = ? AND is_blacklisted = 0',
      [jti, adminId],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0)
          return res.status(401).json({ error: 'Token has been invalidated' });

        // ✅ re-fetch the current role from DB to prevent fake localStorage edits
        connection.query(
          'SELECT id, name, email, role, status FROM admin WHERE id = ? LIMIT 1',
          [adminId],
          (dbErr, adminResults) => {
            if (dbErr) return res.status(500).json({ error: 'Database error' });
            if (adminResults.length === 0)
              return res.status(401).json({ error: 'User not found' });

            const freshAdmin = adminResults[0];

            // attach both decoded + fresh DB role
            req.admin = {
              ...decoded,
              role: freshAdmin.role,
              status: freshAdmin.status,
            };

            next();
          }
        );
      }
    );
  });
};

module.exports = verifyToken;
