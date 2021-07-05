const Stripe = require('stripe');
const JobPost = require('../models/jobPostModel');
const User = require('../models/userModel');
const JobPostOrder = require('../models/jobPostOrderModel');

const path = require('path');

exports.postRequestGetRoutes = async (req, res) => {
  return res.status(200).render('postRequest', {
    title: 'postRequest',
    jobPost: new JobPost(),
  });
};

exports.allMyJobPostGetRoutes = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    const jobPost = await JobPost.find({ userId: user.id })
      .populate({
        path: 'userId',
        select: 'username profileImage',
      })
      .sort('-createdAt');

    return res.status(200).render('allMyJobPost', {
      title: 'allMyJobPost',
      jobPost,
    });
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.allJobPostGetRoutes = async (req, res) => {
  try {
    const jobPost = await JobPost.find({
      jobPostActivityControl: { $ne: 'inactive' },
    })
      .populate({
        path: 'userId',
        select: 'username profileImage',
      })
      .populate({
        path: 'sentRequest.requestSender',
        select: 'username profileImage',
      })
      .sort('-createdAt');

    return res.status(200).render('allJobPost', {
      title: 'allJobPost',
      jobPost,
    });
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.postRequestPostRoutes = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user || user.username !== req.session.sUser.username)
      return res.status(404).redirect('/404');
    const {
      postServiceDetailsDescription,
      category,
      subCategory,
      deliveryDay,
      price,
    } = req.body;

    let attachFiles = [];
    for (let file = 0; file < req.files.length; file++) {
      let attachFileDetails = {};
      attachFileDetails.originalname = req.files[file].originalname;
      attachFileDetails.filename = req.files[file].filename;
      attachFileDetails.mimetype = req.files[file].mimetype;
      attachFiles.push(attachFileDetails);
    }

    const jobPost = new JobPost({
      userId: user.id,
      postServiceDetailsDescription,
      attachFiles,
      category,
      subCategory,
      deliveryDay,
      price,
      jobPostActivityControl: 'active',
    });
    const newJobPost = await jobPost.save();
    await User.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: { jobPost: newJobPost.id },
      }
    );

    return res
      .status(200)
      .redirect(`/user/${req.params.username}/allMyJobPost`);
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.postRequestDeleteGetRoutes = async (req, res) => {
  try {
    let jobPost = await JobPost.findById(req.params.jobPostId)
      .populate({
        path: 'userId',
        select: 'username profileImage',
      });
    if (!jobPost) return res.status(404).redirect('/404');

    await JobPost.findByIdAndDelete(req.params.jobPostId);

    await User.findByIdAndUpdate(jobPost.userId._id, {
      $pull: { jobPost: jobPost.id },
    });

    return res.status(200).redirect(`/user/${req.params.username}/allmyjobpost`);
  } catch (error) {
    console.log(error.message);
    return res.status(404).redirect('/404');
  }
};

exports.postRequestEditGetRoutes = async (req, res) => {
  try {
    let jobPost = await JobPost.findById(req.params.jobPostId);
    if (!jobPost) return res.status(404).redirect('/404');

    return res.status(200).render('postRequestEdit', {
      title: 'postRequestEdit',
      jobPost,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(404).redirect('/404');
  }
};

exports.postRequestEditPutRoutes = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    let jobPost = await JobPost.findById(req.params.jobPostId);
    if (!user || !jobPost)
      return res.status(404).redirect('/404');
    
    const {
      postServiceDetailsDescription,
      category,
      subCategory,
      deliveryDay,
      price,
    } = req.body;

    let attachFiles = [];
    for (let file = 0; file < req.files.length; file++) {
      let attachFileDetails = {};
      attachFileDetails.originalname = req.files[file].originalname;
      attachFileDetails.filename = req.files[file].filename;
      attachFileDetails.mimetype = req.files[file].mimetype;
      attachFiles.push(attachFileDetails);
    }

    const editedJobPost = {
      userId: user.id,
      postServiceDetailsDescription,
      attachFiles,
      category,
      subCategory,
      deliveryDay,
      price,
      jobPostActivityControl: 'active',
    };
    await JobPost.findByIdAndUpdate(req.params.jobPostId, editedJobPost);

    return res
      .status(200)
      .redirect(`/user/${req.params.username}/allMyJobPost`);
  } catch (error) {
    console.log(error.message);
    return res.status(404).redirect('/404');
  }
};

exports.downloadJobPostAttachFilesGetRoutes = async (req, res) => {
  try {
    const { filemimetype, filename } = req.query;
    const dir = path.join(__dirname, '../') + `/public/uploads/` + filename;

    res.set('Content-disposition', 'attachment; filename=' + filename);
    const setMimeType = filemimetype;
    res.set('Content-Type', setMimeType);
    res.download(dir);
  } catch (error) {
    return res.status(404).render('404', {
      title: '404',
    });
  }
};

exports.postRequestSentPutRoutes = async (req, res) => {
  try {
    const { username, jobPostId } = req.params;
    const user = await User.findOne({ username: username });
    const jobPost = await JobPost.findById(jobPostId);
    console.log(jobPost);
    if (!user || !jobPost)
      return res.status(404).redirect('/404');

    const { offerDescription, offerDeliveryDay, offerPrice } = req.body;
    const offer = {
      requestSender: user.id,
      offerDescription,
      offerDeliveryDay,
      offerPrice,
    };

    await JobPost.findByIdAndUpdate(jobPostId, {
      $push: { sentRequest: offer },
    });

    return res.status(200).redirect('/allJobPost');
  } catch (error) {
    console.log(error);
    return res.status(404).redirect('/404');
  }
};

exports.postRequestRemoveGetRoutes = async (req, res) => {
  try {
    const { username, jobPostId, postRequestId } = req.params;
    const user = await User.findOne({ username: username });
    const jobPost = await JobPost.findById(jobPostId);
    if (!user || !jobPost || user.username !== req.session.sUser.username)
      return res.status(404).redirect('/404');

    await JobPost.findByIdAndUpdate(jobPostId, {
      $pull: { sentRequest: { _id: postRequestId } },
    });

    return res.status(200).redirect('/allJobPost');
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.jobPostCheckoutGetRoutes = async (req, res) => {
  try {
    const { username, jobPostId, requestId } = req.params;
    const user = await User.findOne({ username: username });
    const jobPost = await JobPost.findById(jobPostId)
      .populate({
        path: 'sentRequest.requestSender',
        select: 'username profileImage',
      })
      .populate('userId');
    if (!user || !jobPost || user.username !== req.session.sUser.username)
      return res.status(404).redirect('/404');

    let request;
    jobPost.sentRequest.forEach((sRequest) => {
      if (sRequest.id === requestId) request = sRequest;
    });

    console.log(request);

    return res.status(200).render('postCheckout', {
      title: 'checkout',
      keyPublishable: process.env.STRIPE_PUBLISHABLE_KEY,
      user,
      jobPost,
      request,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).redirect('/404');
  }
};

// fn for jobPostCheckoutPostRoutes
async function getUpdated(username, jobPost, data, request, res) {
  // BUYER USER
  await User.findOneAndUpdate(
    { username: username },
    { $push: { createJobPostOrders: data.id } }
  );

  // SELLER USER
  await User.findByIdAndUpdate(request.requestSender, {
    $push: { getJobPostOrders: data.id },
  });

  // JOBPOST
  await JobPost.findByIdAndUpdate(jobPost.id, {
    jobPostActivityControl: 'order in progress',
    $push: { jobPostOrder: data.id },
  });

  return res
    .status(200)
    .redirect(`/user/${username}/jobPostorder/${data.id}/create`);
}

exports.jobPostCheckoutChargePostRoutes = async (req, res) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  const { username, jobPostId, requestId } = req.params;
  const user = await User.findOne({ username: username });
  const jobPost = await JobPost.findById(jobPostId).populate({
    path: 'sentRequest.requestSender',
    select: 'username profileImage',
  });
  if (!user || !jobPost || user.username !== req.session.sUser.username)
    return res.status(404).redirect('/404');

  let request;
  jobPost.sentRequest.forEach((sRequest) => {
    if (sRequest.id === requestId) request = sRequest;
  });

  let amount = parseInt(
    parseFloat(
      parseFloat(request.offerPrice) +
        parseFloat(request.offerPrice * (2.5 / 100))
    ).toFixed(2) * 100
  );

  stripe.customers
    .create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken,
    })
    .then((customer) =>
      stripe.charges.create({
        amount,
        description: 'Job Post Charge',
        currency: 'usd',
        customer: customer.id,
      })
    )
    .then((charge) => {
      // PAYMENT DONE FOR ORDER
      // Order Created
      let jobPostOrder = new JobPostOrder({
        jobPost,
        charge: charge,
        stripeToken: req.body.stripeToken,
        stripeTokenType: req.body.stripeTokenType,
        stripeEmail: req.body.stripeEmail,
        status: false,
        request,
      });
      jobPostOrder
        .save()
        .then((data) => {
          // FUNCTION CALL HAPPENS FOR UPDATE USER AND JOBPOST
          getUpdated(req.session.sUser.username, jobPost, data, request, res);
        })
        .catch((err) => {
          return res
            .status(400)
            .render('404', { error: err.message, title: '404' });
        });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(400)
        .render('404', { error: err.message, title: '404' });
    });
};

exports.jobPostOrderGetRoutes = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    let jobPostOrder = await JobPostOrder.findById(req.params.jobPostOrderId)
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
      });

    const jobPost = await JobPost.findById(jobPostOrder.jobPost)
      .populate({
        path: 'sentRequest.requestSender',
        select: 'username profileImage',
      })
      .populate('userId');

    if (
      !user ||
      !jobPostOrder ||
      !jobPost ||
      user.username !== req.session.sUser.username ||
      (jobPostOrder.jobPost.userId.username !== req.session.sUser.username &&
        jobPostOrder.jobPost.userId.username !== req.params.username)
    ) {
      return res.status(404).redirect('/404');
    }

    // console.log(jobPost);
    // console.log(jobPostOrder);
    // console.log(jobPostOrder.request.requestSender);

    return res.render('jobPostOrder', {
      title: 'jobPostOrder',
      jobPostOrder,
      user,
      jobPost,
      request: jobPostOrder.request,
    });
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.jobPostOrderDeliveryGetRoutes = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    let jobPostOrder = await JobPostOrder.findById(req.params.jobPostOrderId)
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
      });

    const jobPost = await JobPost.findById(jobPostOrder.jobPost)
      .populate({
        path: 'sentRequest.requestSender',
        select: 'username profileImage',
      })
      .populate('userId');

    if (
      !user ||
      !jobPostOrder ||
      !jobPost ||
      user.username !== req.session.sUser.username ||
      (jobPostOrder.request.requestSender.username !==
        req.session.sUser.username &&
        jobPostOrder.request.requestSender.username !== req.params.username)
    ) {
      return res.status(404).redirect('/404');
    }

    console.log(jobPost);
    console.log(jobPostOrder);
    console.log(jobPostOrder.request.requestSender);

    return res.render('jobPostOrderDelivery', {
      title: 'jobPostOrderDelivery',
      jobPostOrder,
      user,
      jobPost,
      request: jobPostOrder.request,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).redirect('/404');
  }
};

exports.deliverJobPostOrderFilePostRoutes = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    let jobPostOrder = await JobPostOrder.findById(req.params.jobPostOrderId)
      .populate({
        path: 'jobPost',
        select: 'postServiceDetailsDescription price',
        populate: {
          path: 'userId',
          select: 'username',
        },
      })
      .populate({
        path: 'request.requestSender',
        select: 'username profileImage',
        model: 'User',
      });

    const jobPost = await JobPost.findById(jobPostOrder.jobPost).populate({
      path: 'sentRequest.requestSender',
      select: 'username profileImage',
    });

    if (
      !user ||
      !jobPostOrder ||
      !jobPost ||
      user.username !== req.session.sUser.username ||
      (jobPostOrder.request.requestSender.username !==
        req.session.sUser.username &&
        jobPostOrder.request.requestSender.username !== req.params.username)
    ) {
      return res.status(404).redirect('/404');
    }
    let deliverProduct = [];
    for (let product = 0; product < req.files.length; product++) {
      let deliverProductDetails = {};
      deliverProductDetails.originalname = req.files[product].originalname;
      deliverProductDetails.filename = req.files[product].filename;
      deliverProductDetails.mimetype = req.files[product].mimetype;
      deliverProduct.push(deliverProductDetails);
    }
    await JobPostOrder.findByIdAndUpdate(jobPostOrder.id, {
      deliveryWork: deliverProduct,
    })
      .then(() => res.redirect(`/user/${req.session.sUser.username}/order`))
      .catch(() => res.status(404).redirect('/404'));
  } catch (error) {
    console.log(error);
    return res.status(404).redirect('/404');
  }
};

exports.downloadJobPostOrderDeliveryProductGetRoutes = async (req, res) => {
  try {
    let jobPostOrder = await JobPostOrder.findById(req.params.jobPostOrderId)
      .populate({
        path: 'jobPost',
        select: 'postServiceDetailsDescription price',
        populate: {
          path: 'userId',
          select: 'username',
        },
      })
      .populate({
        path: 'request.requestSender',
        select: 'username profileImage',
        model: 'User',
      });

    if (!jobPostOrder) {
      return res.status(404).redirect('/404');
    }

    const productIndex = req.params.productIndex;
    const productFilename = req.params.productFilename;
    const dir =
      path.join(__dirname, '../') + `/public/uploads/` + productFilename;

    res.set('Content-disposition', 'attachment; filename=' + productFilename);
    const setMimeType = jobPostOrder.deliveryWork[productIndex].mimetype;
    res.set('Content-Type', setMimeType);
    res.download(dir);
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.completeJobPostOrderPutRoutes = async (req, res) => {
  try {
    let jobPostOrder = await JobPostOrder.findById(req.params.jobPostOrderId)
      .populate({
        path: 'jobPost',
        select: 'postServiceDetailsDescription price',
        populate: {
          path: 'userId',
          select: 'username',
        },
      })
      .populate({
        path: 'request.requestSender',
        select: 'username profileImage',
        model: 'User',
      });

    if (!jobPostOrder) {
      return res.status(404).redirect('/404');
    }

    const seller = await User.findById(jobPostOrder.request.requestSender._id);
    const earn = jobPostOrder.request.offerPrice;
    seller.earnings.totalEarning += earn;
    seller.earnings.totalEarning_JobPost += earn;

    if (!jobPostOrder.status) {
      await JobPostOrder.findByIdAndUpdate(req.params.jobPostOrderId, {
        status: true,
      });

      await JobPost.findByIdAndUpdate(jobPostOrder.jobPost._id, {
        jobPostActivityControl: 'inactive',
      });

      await User.findByIdAndUpdate(jobPostOrder.request.requestSender._id, {
        earnings: {
          totalEarning: seller.earnings.totalEarning,
          totalEarning_Service: seller.earnings.totalEarning_Service,
          totalEarning_JobPost: seller.earnings.totalEarning_JobPost,
        },
      });
    }

    res
      .status(200)
      .redirect(
        `/user/${req.session.sUser.username}/jobPostOrder/${req.params.jobPostOrderId}/create`
      );
  } catch (error) {
    console.log(error);
    return res.status(404).render('404', {
      title: '404',
    });
  }
};

exports.checkJobPostRequestOfferControlGetRoutes = async (req, res) => {
  const jobPost = await JobPost.findById(req.params.jobPostId)
    .populate({
      path: 'sentRequest.requestSender',
      select: 'username profileImage',
    })
    .populate('userId');

  console.log(jobPost);

  return res.json({ jobPost });
};
