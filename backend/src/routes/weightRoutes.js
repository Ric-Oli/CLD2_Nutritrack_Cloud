const express = require('express');
const router = express.Router();
const weightController = require('../controllers/weightController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, weightController.getWeights);
router.post('/', authMiddleware, weightController.addWeight);
router.delete('/:id', authMiddleware, weightController.deleteWeight);

module.exports = router;