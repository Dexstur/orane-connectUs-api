const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noticeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    system: {
      type: Boolean,
      default: true,
    },
    responses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Response',
      },
    ],
  },
  { timestamps: true },
);

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
