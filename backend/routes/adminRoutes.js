
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuthMiddleware = require('../middlewares/adminAuthMiddleware');


router.post('/signup', adminController.signup);
router.post('/signin', adminController.signin);


router.post('/products', adminAuthMiddleware, adminController.addProduct);
router.put('/products/:productId', adminAuthMiddleware, adminController.updateProduct);


module.exports = router;