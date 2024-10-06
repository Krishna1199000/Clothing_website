
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/signup', userController.signup);
router.post('/signin', userController.signin);


router.put('/update-password', authMiddleware, userController.updatePassword);
router.post('/buy', authMiddleware, userController.buyProduct); 
router.post('/add-money', authMiddleware, userController.addMoney);


module.exports = router;
