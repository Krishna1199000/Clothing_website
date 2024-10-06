
const Admin = require('../models/admin/Admin');
const Product = require('../models/admin/Product');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Zod = require('zod');

const signupSchema = Zod.object({
  name: Zod.string().min(1),
  email: Zod.string().email(),
  password: Zod.string().min(6)
});

const signinSchema = Zod.object({
  email: Zod.string().email(),
  password: Zod.string().min(6)
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const admin = await Admin.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: 'Admin registered successfully'});
  } catch (error) {
    
    res.status(500).json({ message: 'Server error' });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body);

 
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET
    );

    res.status(200).json({ token, message: 'Signed in successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = Zod.object({
      name: Zod.string().min(1),
      description: Zod.string().optional(),
      price: Zod.number().positive(),
      stock: Zod.number().int().positive()
    }).parse(req.body);

    
    const product = await Product.create({ name, description, price, stock });

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = Zod.object({
      name: Zod.string().min(1).optional(),
      description: Zod.string().optional(),
      price: Zod.number().positive().optional(),
      stock: Zod.number().int().positive().optional()
    }).parse(req.body);

    
    const product = await Product.findByIdAndUpdate(productId, updates, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
