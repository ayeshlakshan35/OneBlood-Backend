const express = require('express');
const router = express.Router();
const { addCamp, getUserCamps, getAllCamps, deleteCamp } = require('../controllers/campController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/add', verifyToken, upload.single('document'), addCamp);
router.get('/my-camps', verifyToken, getUserCamps);
router.get('/all-camps', getAllCamps);
router.delete('/delete/:id', verifyToken, deleteCamp);
module.exports = router;
