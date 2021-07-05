const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    charge: {
      type: Object,
      required: true,
    },
    stripeToken: {
      type: String,
      required: true,
    },
    stripeTokenType: {
      type: String,
      required: true,
    },
    stripeEmail: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    deliveryWork: [
      {
        originalname: { type: String },
        filename: { type: String },
        mimetype: { type: String },
      },
    ],
    feedback: { type: Array },
  },
  { timestamps: true }
);

const Order = mongoose.model("order", orderSchema);
module.exports = Order;
