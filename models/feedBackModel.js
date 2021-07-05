const mongoose = require("mongoose");

const feedBackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
    },
    feedbacktext: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  },
  { timestamps: true }
);

const FeedBack = mongoose.model("feedback", feedBackSchema);
module.exports = FeedBack;
