const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema(
  {
    token: {
      type: String,
    },
    purpose: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
