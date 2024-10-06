
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Amount must be positive']
  },
  type: { 
    type: String, 
    enum: ['add'], 
    default: 'add' 
  },

});

module.exports = mongoose.model('Transaction', transactionSchema);
