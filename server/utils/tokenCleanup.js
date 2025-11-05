// utils/tokenCleanup.js
const connection = require('../connection/connection');

const blacklistExpiredToken = () => {
  const now = new Date();
  connection.query(
    "UPDATE active_tokens SET is_blacklisted = 1 WHERE expires_at < ? AND is_blacklisted = 0",
    [now],
    (err, result) => {
      if (err) {
        console.error('Error blacklist Expired Token:', err);
      } else {
        console.log(`Black list ${result.affectedRows} expired tokens`);
      }
    }
  );
};
const cleanUpExpiredToken = () => {
  const now = new Date();
  connection.query(
    "DELETE FROM active_tokens WHERE is_blacklisted=1",
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
setInterval(blacklistExpiredToken, 5 * 60 * 1000);

module.exports = { cleanUpExpiredToken, blacklistExpiredToken };
