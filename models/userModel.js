const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userBio: {
      type: String,
      trim: true,
    },
    fullname: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 1024,
    },
    phonenumber: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    address: {
      type: String,
    },
    services: { type: Array },
    createOrders: { type: Array },
    getOrders: { type: Array },
    sentFeedBack: { type: Array },
    receiveFeedBack: { type: Array },
    messageReceivers: { type: Array },
    jobPost: { type: Array },
    createJobPostOrders: { type: Array },
    getJobPostOrders: { type: Array },
    earnings: {
      totalEarning: { type: Number, default: 0 },
      totalEarning_Service: { type: Number, default: 0 },
      totalEarning_JobPost: { type: Number, default: 0 },
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
