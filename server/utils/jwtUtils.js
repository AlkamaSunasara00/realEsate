const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const ACCESS_TOKEN_SECRET = 'f8b54dd08c66f24176c682a3a74f7818c740ee5c1805c3e88a16ac1c92d1e721';

function generateAccessToken(admin, ip, userAgent) {
  const jti = uuidv4();
  return {
    token: jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, status: admin.status, jti, ip, userAgent },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    ),
    jti,
  };
}

module.exports = { generateAccessToken, ACCESS_TOKEN_SECRET };
