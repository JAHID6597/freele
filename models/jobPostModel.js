const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postServiceDetailsDescription: {
      type: String,
      required: true,
    },
    attachFiles: [
      {
        _id: false,
        originalname: { type: String, required: true },
        filename: { type: String, required: true },
        mimetype: { type: String, required: true },
      },
    ],
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    deliveryDay: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sentRequest: [
      {
        requestSender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        offerDescription: { type: String },
        offerDeliveryDay: { type: Number },
        offerPrice: { type: Number },
      },
    ],
    jobPostOrder: {
      type: Array,
    },
    jobPostActivityControl: { type: String, required: true },
  },
  { timestamps: true }
);

const JobPost = mongoose.model('JobPost', jobPostSchema);
module.exports = JobPost;
