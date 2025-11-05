// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// NOTE: Replace with process.env.ACCESS_TOKEN_SECRET in production
const ACCESS_TOKEN_SECRET = 'f8b54dd08c66f24176c682a3a74f7818c740ee5c1805c3e88a16ac1c92d1e721';

function generateAccessToken(admin, ip, userAgent) {
  const jti = uuidv4();
  // include role in token so middleware/front-end can detect role quickly
  return {
    token: jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        status: admin.status,
        role: admin.role || 'client',
        jti,
        ip,
        userAgent
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    ),
    jti,
  };
}

module.exports = { generateAccessToken, ACCESS_TOKEN_SECRET };
