const express = require('express');
const router = express.Router();
const { addCamp, getUserCamps, getAllCamps, deleteCamp } = require('../controllers/campController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/add', verifyToken, upload.single('document'), addCamp);
router.get('/user-camps', verifyToken, getUserCamps);
router.get('/all-camps', getAllCamps);
router.delete('/:id', verifyToken, deleteCamp);

// Test endpoint to check if routes are working
router.get('/test', (req, res) => {
  res.json({ message: "Camp routes are working!" });
});
module.exports = router;
