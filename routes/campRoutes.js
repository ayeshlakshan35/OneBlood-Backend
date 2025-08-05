const express = require('express');
const router = express.Router();
const { addCamp, getUserCamps, getAllCamps } = require('../controllers/campController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/add', verifyToken, upload.single('document'), addCamp);
router.get('/my-camps', verifyToken, getUserCamps);
router.get('/all-camps', getAllCamps);
module.exports = router;
