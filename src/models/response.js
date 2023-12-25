const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notice: {
      type: Schema.Types.ObjectId,
      ref: 'Notice',
      required: true,
    },
  },
  { timestamps: true },
);

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
