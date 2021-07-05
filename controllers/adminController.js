const JobPost = require('../models/jobPostModel');
const JobPostOrder = require('../models/jobPostOrderModel');
const Order = require('../models/orderModel');
const Service = require('../models/serviceModel');
const User = require('../models/userModel');

exports.adminDashboardGetRoutes = async (req, res) => {
  try {
    const order = await Order.find().populate({
      path: 'service',
      select: 'userId pricing',
    });
    const user = await User.find().sort('-createdAt');
    const jobPostOrder = await JobPostOrder.find()
      .populate({
        path: 'jobPost',
        select: 'postServiceDetailsDescription price',
        populate: {
          path: 'userId',
          select: 'username profileImage',
        },
      })
      .populate({
        path: 'request.requestSender',
        select: 'username profileImage',
        model: 'User',
      })
      .sort('-createdAt');
    const service = await Service.find()
      .populate({
        path: 'userId',
        select: 'username profileImage',
      })
      .sort({ createdAt: -1 });
    const jobPost = await JobPost.find()
      .populate({
        path: 'userId',
        select: 'username profileImage',
      })
      .populate({
        path: 'sentRequest.requestSender',
        select: 'username profileImage',
      })
      .sort('-createdAt');

    let userEarnings;
    await User.aggregate([
      {
        $group: {
          _id: null,
          totalEarning_Service: {
            $sum: '$earnings.totalEarning_Service',
          },
          totalEarning_JobPost: {
            $sum: '$earnings.totalEarning_JobPost',
          },
        },
      },
    ]).then((d) => {
      userEarnings = d;
    });

    return res.status(200).render('adminDashboard', {
      title: 'Dashboard',
      order,
      jobPost,
      jobPostOrder,
      service,
      user,
      userEarnings,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).redirect('/404');
  }
};

