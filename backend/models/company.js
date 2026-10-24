
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sector: {
      type: String,
      required: true,
      trim: true,
    },
    headquarter: {
      type: String,
      required: true,
      trim: true,
    },
    founded: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Company', companySchema);
