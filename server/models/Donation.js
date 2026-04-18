const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'INR' },
  message: { type: String, default: '' },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['pending','completed','failed','refunded'], default: 'completed' },
  transactionId: { type: String, default: () => `TXN${Date.now()}${Math.floor(Math.random()*10000)}` },
  paymentMethod: { type: String, enum: ['upi','card','netbanking','wallet','cash'], default: 'upi' },
}, { timestamps: true });

donationSchema.post('save', async function() {
  try {
    const NGO = require('./NGO');
    await NGO.findByIdAndUpdate(this.ngo, { $inc: { totalDonations: this.amount, donorCount: 1 } });
  } catch(e) {}
});

module.exports = mongoose.model('Donation', donationSchema);
