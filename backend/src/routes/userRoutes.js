const express = require('express');
const router = express.Router();

/* ALL CONTROLLERS */
const userController = require('../controllers/userController');

/* ------------ ROUTING ------------ */

/* USER */
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

module.exports = router;