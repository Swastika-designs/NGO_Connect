const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },

  // Donation type: money or goods
  donationType: { type: String, enum: ['money','goods'], default: 'money' },

  // Money fields
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['upi','card','netbanking','wallet','cash'], default: 'upi' },

  // Goods fields
  goodsCategory: { type: String, enum: ['clothes','food','electronics','books','furniture','toys','medical','other'], default: 'other' },
  goodsDescription: { type: String, default: '' },
  goodsQuantity: { type: String, default: '' },
  pickupMethod: { type: String, enum: ['donor_dropoff','ngo_pickup'], default: 'donor_dropoff' },
  pickupAddress: { type: String, default: '' },
  pickupDate: { type: Date },

  message: { type: String, default: '' },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['pending','completed','failed','refunded'], default: 'completed' },
  transactionId: { type: String, default: () => `TXN${Date.now()}${Math.floor(Math.random()*10000)}` },
}, { timestamps: true });

donationSchema.post('save', async function() {
  try {
    if (this.donationType === 'money' && this.amount > 0) {
      const NGO = require('./NGO');
      await NGO.findByIdAndUpdate(this.ngo, { $inc: { totalDonations: this.amount, donorCount: 1 } });
    }
  } catch(e) {}
});

module.exports = mongoose.model('Donation', donationSchema);
