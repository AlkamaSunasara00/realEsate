const express = require('express');
const router = express.Router();
const login = require('../../controller/login/login');
const verifyToken = require('../../middleware/verifyToken');
const upload = require('../../middleware/fileHandler');

router.post('/login', login.login);
router.post('/refresh-token', verifyToken, login.refreshToken);
router.post('/update-activity', verifyToken, login.updateActivity);
router.post('/logout', verifyToken, login.logout);
router.get('/getagencybyid/:id', verifyToken, login.getAgencyById);
router.post('/add-client', verifyToken, upload.single("img"), login.addClient);

router.get('/clients', verifyToken, login.getClient);
router.put('/update-client/:id', verifyToken, upload.single("img"), login.updateClient);
router.delete('/delete-client/:id', verifyToken, login.deleteClient);




module.exports = router;
