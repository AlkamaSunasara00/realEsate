// routes/login/login.js
const express = require('express');
const router = express.Router();
const login = require('../../controller/login/login');
const verifyToken = require('../../middleware/verifyToken');
const authorizeRole = require('../../middleware/authorizeRole');
const upload = require('../../middleware/fileHandler');

router.post('/login', login.login);
router.post('/refresh-token', verifyToken, login.refreshToken);
router.post('/update-activity', verifyToken, login.updateActivity);
router.post('/logout', verifyToken, login.logout);
router.get('/getUserById/:id', verifyToken, login.getUserById);

// Example: only admin can add clients via this route (adjust as you need)
router.post('/add-client', verifyToken, authorizeRole('admin'), upload.single("img"), login.addClient);
router.get('/clients', verifyToken, authorizeRole('admin'), login.getClient);
router.put('/update-client/:id', verifyToken, authorizeRole('admin'), upload.single("img"), login.updateClient);
router.delete('/delete-client/:id', verifyToken, authorizeRole('admin'), login.deleteClient);

module.exports = router;
