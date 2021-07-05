const mongoose = require("mongoose");

const jobPostOrderSchema = new mongoose.Schema(
  {
    jobPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
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
    request: {
      type: Object,
      required: true,
    },
    deliveryWork: [
      {
        originalname: { type: String },
        filename: { type: String },
        mimetype: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const JobPostOrder = mongoose.model("jobPostOrder", jobPostOrderSchema);
module.exports = JobPostOrder;
