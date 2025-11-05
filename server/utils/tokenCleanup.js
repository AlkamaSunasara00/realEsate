// utils/tokenCleanup.js
const connection = require('../connection/connection');

const cleanupExpiredTokens = () => {
  const now = new Date();
  connection.query(
    "UPDATE active_tokens SET is_blacklisted = 1 WHERE expires_at < ? AND is_blacklisted = 0",
    [now],
    (err, result) => {
      if (err) {
        console.error('Error cleaning up expired tokens:', err);
      } else {
        console.log(`Cleaned up ${result.affectedRows} expired tokenss`);
      }
    }
  );
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

module.exports = { cleanupExpiredTokens };
