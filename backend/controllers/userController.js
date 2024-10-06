
const User = require('../models/user/User');
const Product = require('../models/admin/Product');
const Order = require('../models/user/Order');
const Transaction = require("../models/user/Transaction");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Zod = require('zod');
const mongoose = require('mongoose');


const signupSchema = Zod.object({
  name: Zod.string().min(1, 'Name is required'),
  email: Zod.string().email('Invalid email address'),
  password: Zod.string().min(6, 'Password must be at least 6 characters')
});

const signinSchema = Zod.object({
  email: Zod.string().email('Invalid email address'),
  password: Zod.string().min(6, 'Password must be at least 6 characters')
});

const updatePasswordSchema = Zod.object({
  oldPassword: Zod.string().min(6, 'Old password must be at least 6 characters'),
  newPassword: Zod.string().min(6, 'New password must be at least 6 characters')
});

const buyProductSchema = Zod.object({
  productId: Zod.string().length(24, 'Invalid product ID'),
  quantity: Zod.number().int().positive('Quantity must be a positive integer')
});

const addMoneySchema = Zod.object({
    amount:Zod.number().positive()
})

exports.signup = async (req, res) => {
  try {
   
    const { name, email, password } = signupSchema.parse(req.body);

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = await User.create({ name, email, password: hashedPassword });

    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {  
    res.status(500).json({ message: 'Server error' });
  }
};


exports.signin = async (req, res) => {
  try {
   
    const { email, password } = signinSchema.parse(req.body);

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

   
    res.status(200).json({ token, message: 'Signed in successfully' });
  } catch (error) { 
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updatePassword = async (req, res) => {
  try {
    
    const { oldPassword, newPassword } = updatePasswordSchema.parse(req.body);

    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid old password' });

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    
    await user.save();

    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    
    res.status(500).json({ message: 'Server error' });
  }
};

exports.buyProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    
    const { productId, quantity } = buyProductSchema.parse(req.body);

    
    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Product not found' });
    }

    
    if (product.stock < quantity) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    
    product.stock -= quantity;
    await product.save();

    
    const order = await Order.create({
      user: req.user._id,
      product: productId,
      quantity,
      total: product.price * quantity
    });

    
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Purchase successful', order });
  } catch (error) {
    
    await session.abortTransaction();
    session.endSession();

    
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addMoney = async (req,res) => {
    try{
        const {amount} = addMoneySchema.parse(req.body);

        req.user.balance += amount;
        await req.user.save();

        const transaction = await Transaction.create({
            user: req.user._id,
            amount,
            type: 'add'
        });

        res.status(200).json({message: 'Money added successfully', balance: req.user.balance, transaction})
    } catch(error){
        res.status(500).json({message: 'Server error'})
    }
}