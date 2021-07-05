// const mime = require("mime-types");
const path = require('path');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const generateServiceFilter = require('../middleware/generateServiceFilter');

const Stripe = require('stripe');
const User = require('../models/userModel');
const Service = require('../models/serviceModel');
const Order = require('../models/orderModel');
const FeedBack = require('../models/feedBackModel');
const JobPost = require('../models/jobPostModel');
const JobPostOrder = require('../models/jobPostOrderModel');

exports.homeRoutes = async (req, res) => {
  const service = await Service.find()
    .populate({
      path: 'userId',
      select: 'username profileImage',
    })
    .sort({ createdAt: -1 })
    .limit(4);
  return res.status(200).render('index', {
    title: 'freele',
    service: service,
  });
};

exports.signInGetRoutes = async (req, res) => {
  return res.status(200).render('signin', {
    title: 'signin',
    user: new User(),
  });
};

exports.signUpGetRoutes = async (req, res) => {
  return res.status(200).render('signup', {
    title: 'signup',
    user: new User(),
  });
};

exports.profileGetRoutes = async (req, res) => {
  let user = await User.findOne({
    username: req.params.username,
  });
  if (!user)
    return res.status(404).render('404', {
      title: '404',
    });
  let service = await Service.find({ userId: user.id })
    .populate({
      path: 'userId',
      select: 'username profileImage',
    })
    .sort('-createdAt');
  const jobPost = await JobPost.find({ userId: user.id })
    .populate({
      path: 'userId',
      select: 'username profileImage',
    })
    .populate({
      path: 'sentRequest.requestSender',
      select: 'username profileImage',
    })
    .sort('-createdAt');
  const receiveFeedBacks = await FeedBack.find({
    _id: { $in: user.receiveFeedBack },
  })
    .populate({
      path: 'sender receiver',
      select: 'username profileImage',
    })
    .populate({
      path: 'service',
      select: 'slug',
    });
  return res.status(200).render('profile', {
    title: 'profile',
    user: user,
    service: service,
    jobPost,
    receiveFeedBacks,
  });
};

exports.editProfileGetRoutes = async (req, res) => {
  let user = await User.findOne({
    username: req.params.username,
  });
  if (!user)
    return res.status(404).render('404', {
      title: '404',
    });
  return res.status(200).render('editProfile', {
    title: 'editProfile',
    user: user,
  });
};

exports.createNewServiceGetRoutes = async (req, res) => {
  let user = await User.findOne({
    username: req.params.username,
  });
  if (!user)
    return res.status(404).render('404', {
      title: '404',
    });
  return res.status(200).render('uploadService', {
    title: 'uploadService',
    user: user,
    service: new Service(),
  });
};

exports.singleServiceGetRoutes = async (req, res) => {
  let service = await Service.findOne({
    slug: req.params.slug,
  }).populate({
    path: 'userId',
    select: 'username profileImage',
  });

  if (!service || req.params.username !== service.userId.username)
    return res.status(404).render('404', {
      title: '404',
    });

  const feedbacks = await FeedBack.find({ _id: service.feedback }).populate({
    path: 'sender',
    select: 'username profileImage',
  });

  // console.log(feedbacks);

  return res.status(200).render('singleService', {
    title: 'service',
    service: service,
    feedbacks,
  });
};

exports.singleServiceEditGetRoutes = async (req, res) => {
  let user = await User.findOne({
    username: req.params.username,
  });
  if (!user)
    return res.status(404).render('404', {
      title: '404',
    });

  let service = await Service.findOne({ slug: req.params.slug }).populate({
    path: 'userId',
    select: 'username profileImage',
  });
  if (!service || req.params.username !== service.userId.username)
    return res.status(404).render('404', {
      title: '404',
    });
  return res.status(200).render('editService', {
    title: 'editService',
    user: user,
    service: service,
  });
};

exports.signInPostRoutes = async (req, res) => {
  let user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  let error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).render('signin', {
      title: 'signin',
      errors: error,
      user: user,
    });
  }
  try {
    let findUser = await User.findOne({
      username: req.body.username,
    });

    let validUserPassword;
    if (findUser)
      validUserPassword = await bcrypt.compare(
        req.body.password,
        findUser.password
      );

    let loginCheck = false;
    if (!findUser || !validUserPassword) loginCheck = false;
    else loginCheck = true;

    if (!loginCheck) {
      error.errors.push({
        msg: 'Invalid username or password',
        param: 'invalidSignIn',
        location: 'body',
      });
      return res.status(400).render('signin', {
        title: 'signin',
        errors: error,
        user: user,
      });
    } else {
      // SIGNIN DONE
      req.session.isLogin = true;
      req.session.sUser = findUser;
      if (findUser.isAdmin) req.session.isLoginAdmin = true;
      else req.session.isLoginAdmin = false;
      return res.status(200).redirect(`/user/${findUser.username}`);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).render('signin', {
      title: 'signin',
      errors: error,
      user: user,
    });
  }
};

exports.signUpPostRoutes = async (req, res) => {
  let user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  let error = validationResult(req);

  let userName = await User.findOne({
    username: req.body.username,
  });
  if (userName) {
    error.errors.push({
      msg: 'duplicate username',
      param: 'username',
      location: 'body',
    });
    return res.status(400).render('signup', {
      title: 'signup',
      errors: error,
      user: user,
    });
  }

  if (!error.isEmpty()) {
    return res.status(400).render('signup', {
      title: 'signup',
      errors: error,
      user: user,
    });
  }

  let newUser = user;

  try {
    let hashPassword = await bcrypt.hash(req.body.password, 10);
    newUser.password = hashPassword;

    await newUser
      .save()
      .then(() => {
        // SIGNUP DONE
        req.session.isLogin = true;
        req.session.sUser = newUser;
        return res.status(200).redirect(`/user/${newUser.username}`);
      })
      .catch(() =>
        res.status(400).render('signup', {
          title: 'signup',
          user: user,
        })
      );
  } catch (error) {
    res.status(400).render('signup', {
      title: 'signup',
      user: user,
    });
  }
};

exports.logOutRoutes = async (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(400).redirect('/signin');
  });
};

exports.editProfilePutRoutes = async (req, res) => {
  let user = new User({
    userBio: req.body.userBio || '',
    fullname: req.body.fullname || '',
    username: req.body.username,
    email: req.body.email,
    password: req.session.sUser.password,
    phonenumber: req.body.phonenumber || '',
    profileImage: req.session.sUser.profileImage || '',
    address: req.body.address || '',
  });

  if (req.file) user.profileImage = req.file.filename;

  let error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).render('editProfile', {
      title: 'editProfile',
      errors: error,
      user: user,
    });
  }

  let findUser = await User.findOne({
    username: req.session.sUser.username,
  });
  if (!findUser)
    return res.status(400).render('editProfile', {
      title: 'editProfile',
      user: user,
    });

  let newUser = {
    userBio: req.body.userBio || '',
    fullname: req.body.fullname || '',
    username: req.body.username,
    email: req.body.email,
    password: req.session.sUser.password,
    phonenumber: req.body.phonenumber || '',
    profileImage: req.session.sUser.profileImage || '',
    address: req.body.address || '',
  };

  if (req.file) newUser.profileImage = req.file.filename;

  if (req.session.sUser.username !== req.body.username) {
    let checkUser = await User.findOne({
      username: req.body.username,
    });
    if (checkUser) {
      error.errors.push({
        msg: 'duplicate username',
        param: 'username',
        location: 'body',
      });
      return res.status(400).render('editProfile', {
        title: 'editProfile',
        errors: error,
        user: user,
      });
    }
  }

  try {
    await User.updateOne(
      {
        username: req.session.sUser.username,
      },
      newUser,
      {
        new: true,
      }
    )
      .then(() => {
        // EDIT DONE
        req.session.sUser = newUser;
        return res.status(200).redirect(`/user/${newUser.username}`);
      })
      .catch((err) => {
        console.log('catch', err);
        res.status(400).render('editProfile', {
          title: 'editProfile',
          user: user,
        });
      });
  } catch (error) {
    console.log('catch', error);
    res.status(400).render('editProfile', {
      title: 'editProfile',
      user: user,
    });
  }
};

exports.createNewServicePostRoutes = async (req, res) => {
  console.log(req.body);
  let user = await User.findOne({
    username: req.params.username,
  });
  if (!user)
    return res.status(404).render('404', {
      title: '404',
    });

  const {
    serviceTitle,
    category,
    subCategory,
    serviceTags,
    basicPrice,
    basicPackageName,
    basicDeliveryDay,
    basicPackageDescription,
    standardPrice,
    standardPackageName,
    standardDeliveryDay,
    standardPackageDescription,
    premiumPrice,
    premiumPackageName,
    premiumDeliveryDay,
    premiumPackageDescription,
    serviceDescription,
  } = req.body;

  const thumbnailImage = req.file.filename;
  let price = {
    price: [basicPrice * 1, standardPrice * 1, premiumPrice * 1],
    packageName: [basicPackageName, standardPackageName, premiumPackageName],
    deliveryDay: [basicDeliveryDay, standardDeliveryDay, premiumDeliveryDay],
    description: [
      basicPackageDescription,
      standardPackageDescription,
      premiumPackageDescription,
    ],
  };
  const service = {
    serviceTitle,
    category,
    subCategory,
    serviceTags,
    pricing: price,
    serviceDescription,
    thumbnailImage: thumbnailImage,
  };

  let serviceTagsError = true;
  if (serviceTags) serviceTagsError = false;

  let standardError = true;
  if (
    !standardPrice &&
    !standardPackageName &&
    !standardDeliveryDay &&
    !standardPackageDescription
  )
    standardError = false;
  else if (
    standardPrice &&
    standardPackageName &&
    standardDeliveryDay &&
    standardPackageDescription
  )
    standardError = false;

  let premiumError = true;
  if (
    !premiumPrice &&
    !premiumPackageName &&
    !premiumDeliveryDay &&
    !premiumPackageDescription
  )
    premiumError = false;
  else if (
    premiumPrice &&
    premiumPackageName &&
    premiumDeliveryDay &&
    premiumPackageDescription
  )
    premiumError = false;

  let serviceDescriptionError = true;
  if (serviceDescription) serviceDescriptionError = false;

  if (premiumError || standardError || serviceDescriptionError)
    return res.status(200).render('uploadService', {
      title: 'uploadService',
      user: user,
      service,
      standardError,
      premiumError,
      serviceTagsError,
      serviceDescriptionError,
    });

  let newService = new Service({
    userId: user.id,
    serviceTitle: serviceTitle,
    category: category,
    subCategory: subCategory,
    serviceTags: serviceTags,
    pricing: price,
    serviceDescription: serviceDescription,
    sanitizeServiceDescription: serviceDescription,
    thumbnailImage: thumbnailImage,
  });
  newService.slug = await newService.slugControl(newService.serviceTitle);

  try {
    const newSingleService = await newService.save();
    await User.findOneAndUpdate(
      { username: user.username },
      { $push: { services: newSingleService.id } }
    );

    return res
      .status(200)
      .redirect(`/user/${user.username}/service/${newSingleService.slug}`);
  } catch (error) {
    return res.status(200).render('uploadService', {
      title: 'uploadService',
      user: user,
      service,
    });
  }
};

exports.allServicesGetRoutes = async (req, res) => {
  const totalItemPerPage = 4;
  const currentPageNumber = parseInt(req.query.page) || 1;

  const filter = req.query.filter || 'recent';
  const beforeDate = generateServiceFilter(filter.toLowerCase());

  let service, totalServices;
  if (parseInt(req.query.minimumPrice) > parseInt(req.query.maximumPrice)) {
    return res.status(200).render('allServices', {
      title: 'All Services',
      service: [],
      filter: filter,
      totalPages: 0,
      errorPrice: true,
      totalItemPerPage: {},
      currentPageNumber: {},
    });
  }
  let priceFilter = false;
  if (req.query.minimumPrice && req.query.maximumPrice) {
    priceFilter = true;
    service = await Service.find({
      'pricing.price': {
        $elemMatch: {
          $gte: parseInt(req.query.minimumPrice),
          $lte: parseInt(req.query.maximumPrice),
        },
      },
    })
      .populate({
        path: 'userId',
        select: 'username profileImage',
      })
      .sort('pricing.price')
      .skip(currentPageNumber * totalItemPerPage - totalItemPerPage)
      .limit(totalItemPerPage);

    totalServices = await Service.countDocuments({
      'pricing.price': {
        $elemMatch: {
          $gte: parseInt(req.query.minimumPrice),
          $lte: parseInt(req.query.maximumPrice),
        },
      },
    });
  } else {
    service = await Service.find(
      beforeDate ? { createdAt: { $gt: beforeDate } } : {}
    )
      .populate({
        path: 'userId',
        select: 'username profileImage',
      })
      .sort(beforeDate ? { createdAt: 1 } : { createdAt: -1 })
      .skip(currentPageNumber * totalItemPerPage - totalItemPerPage)
      .limit(totalItemPerPage);

    totalServices = await Service.countDocuments(
      beforeDate ? { createdAt: { $gt: beforeDate } } : {}
    );
  }

  let totalPages = Math.ceil(totalServices / totalItemPerPage);

  return res.status(200).render('allServices', {
    title: 'All Services',
    service: service,
    filter: filter,
    totalPages,
    errorPrice: false,
    totalItemPerPage,
    currentPageNumber,
    priceFilter,
    minimumPrice: req.query.minimumPrice,
    maximumPrice: req.query.maximumPrice,
  });
};

exports.editServicesPutRoutes = async (req, res) => {
  let user = await User.findOne({
    username: req.params.username,
  });
  if (!user)
    return res.status(404).render('404', {
      title: '404',
    });

  let service = await Service.findOne({ slug: req.params.slug }).populate({
    path: 'userId',
    select: 'username profileImage',
  });
  if (!service || req.params.username !== service.userId.username)
    return res.status(404).render('404', {
      title: '404',
    });

  const {
    serviceTitle,
    category,
    subCategory,
    serviceTags,
    basicPrice,
    basicPackageName,
    basicDeliveryDay,
    basicPackageDescription,
    standardPrice,
    standardPackageName,
    standardDeliveryDay,
    standardPackageDescription,
    premiumPrice,
    premiumPackageName,
    premiumDeliveryDay,
    premiumPackageDescription,
    serviceDescription,
  } = req.body;

  let thumbnailImage = service.thumbnailImage;
  if (req.file) thumbnailImage = req.file.filename;

  let price = {
    price: [basicPrice * 1, standardPrice * 1, premiumPrice * 1],
    packageName: [basicPackageName, standardPackageName, premiumPackageName],
    deliveryDay: [basicDeliveryDay, standardDeliveryDay, premiumDeliveryDay],
    description: [
      basicPackageDescription,
      standardPackageDescription,
      premiumPackageDescription,
    ],
  };
  const checkService = {
    serviceTitle,
    category,
    subCategory,
    serviceTags,
    pricing: price,
    serviceDescription,
    thumbnailImage,
  };

  let serviceTagsError = true;
  if (serviceTags) serviceTagsError = false;

  let standardError = true;
  if (
    !standardPrice &&
    !standardPackageName &&
    !standardDeliveryDay &&
    !standardPackageDescription
  )
    standardError = false;
  else if (
    standardPrice &&
    standardPackageName &&
    standardDeliveryDay &&
    standardPackageDescription
  )
    standardError = false;

  let premiumError = true;
  if (
    !premiumPrice &&
    !premiumPackageName &&
    !premiumDeliveryDay &&
    !premiumPackageDescription
  )
    premiumError = false;
  else if (
    premiumPrice &&
    premiumPackageName &&
    premiumDeliveryDay &&
    premiumPackageDescription
  )
    premiumError = false;

  let serviceDescriptionError = true;
  if (serviceDescription) serviceDescriptionError = false;

  if (premiumError || standardError || serviceDescriptionError)
    return res.status(200).render('editService', {
      title: 'editService',
      user: user,
      service: checkService,
      standardError,
      premiumError,
      serviceTagsError,
      serviceDescriptionError,
    });

  let editedService = {
    userId: user.id,
    serviceTitle: serviceTitle,
    category: category,
    subCategory: subCategory,
    serviceTags: serviceTags,
    pricing: price,
    serviceDescription: serviceDescription,
    sanitizeServiceDescription: serviceDescription,
    thumbnailImage: thumbnailImage,
  };
  if (serviceTitle !== service.serviceTitle) {
    console.log('pppppppp');
    let serviceModel = new Service();
    serviceModel.slug = await serviceModel.slugControl(serviceTitle);
    editedService.slug = serviceModel.slug;
  }

  if (
    editedService.thumbnailImage !== service.thumbnailImage &&
    req.file.filename !== 'undefined'
  )
    editedService.thumbnailImage = req.file.filename;

  try {
    await Service.findByIdAndUpdate(service._id, editedService, { new: true })
      .then((data) =>
        res.status(200).redirect(`/user/${user.username}/service/${data.slug}`)
      )
      .catch(() =>
        res.status(400).render('editService', {
          title: 'editService',
          user: user,
          service: service,
        })
      );
  } catch (error) {
    return res.status(400).render('editService', {
      title: 'editService',
      user: user,
      service: service,
    });
  }
};

exports.deleteServiceGetRoutes = async (req, res) => {
  let user = await User.findOne({
    username: req.params.username,
  });
  if (!user)
    return res.status(404).render('404', {
      title: '404',
    });

  let service = await Service.findOne({ slug: req.params.slug }).populate({
    path: 'userId',
    select: 'username profileImage',
  });
  if (!service || req.params.username !== service.userId.username)
    return res.status(404).render('404', {
      title: '404',
    });

  try {
    await Service.findByIdAndDelete(service._id);
    await User.findByIdAndUpdate(service.userId, {
      $pull: { services: service.id },
    });
    return res.status(400).redirect(`/user/${user.username}`);
  } catch (error) {
    return res.status(400).render('singleService', {
      title: 'singleService',
      user: user,
      service: service,
    });
  }
};

exports.searchServiceGetRoutes = async (req, res) => {
  let searchItem = req.query.searchItem;
  if (!searchItem)
    return res.render('search', {
      title: 'search',
      service: [],
      searchItem,
    });
  try {
    let searchObj = { $regex: searchItem, $options: '$i' };

    let service = await Service.find({
      $or: [
        { serviceTitle: searchObj },
        { category: searchObj },
        { subCategory: searchObj },
        { serviceDescription: searchObj },
      ],
    }).populate({
      path: 'userId',
      select: 'username profileImage',
    });
    if (!service) return res.status(404).redirect('/404');

    return res.render('search', {
      title: 'search',
      service,
      searchItem,
    });
  } catch (error) {
    return res.render('404', {
      title: '404',
      service,
      searchItem,
    });
  }
};

exports.orderGetRoutes = async (req, res) => {
  try {
    let order = await Order.findById(req.params.orderId)
      .populate({
        path: 'service',
        select: 'serviceTitle pricing thumbnailImage slug',
        populate: {
          path: 'userId',
          select: 'username',
        },
      })
      .populate({
        path: 'user',
        select: 'username',
      });

    if (
      !order ||
      (order.user.username !== req.session.sUser.username &&
        order.user.username !== req.params.username)
    ) {
      return res.status(404).redirect('/404');
    }
    // console.log(order);
    return res.render('order', {
      title: 'order',
      order: order,
    });
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.orderDeliveryGetRoutes = async (req, res) => {
  try {
    let order = await Order.findById(req.params.orderId)
      .populate({
        path: 'service',
        select: 'serviceTitle pricing thumbnailImage slug',
        populate: {
          path: 'userId',
          select: 'username',
        },
      })
      .populate({
        path: 'user',
        select: 'username',
      });
    if (
      !order ||
      (order.service.userId.username !== req.session.sUser.username &&
        order.service.userId.username !== req.params.username)
    ) {
      return res.status(404).redirect('/404');
    }
    // console.log(order);
    return res.render('orderDelivery', {
      title: 'orderDelivery',
      order: order,
    });
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.checkoutGetRoutes = async (req, res) => {
  let user = await User.findOne({
    username: req.params.username,
  });

  if (!user)
    return res.status(404).render('404', {
      title: '404',
    });

  let service = await Service.findOne({ slug: req.params.slug }).populate({
    path: 'userId',
    select: 'username profileImage',
  });
  if (!service)
    return res.status(404).render('404', {
      title: '404',
    });

  if (service.userId.username === req.session.sUser.username)
    return res.status(404).render('404', {
      title: '404',
    });

  return res.render('checkout', {
    keyPublishable: process.env.STRIPE_PUBLISHABLE_KEY,
    title: 'checkout',
    index: req.query.index,
    service: service,
  });
};

// fn for checkoutPostRoutes
async function getUpdated(username, service, data, res) {
  // BUYER USER
  await User.findOneAndUpdate(
    { username: username },
    { $push: { createOrders: data.id } }
  );

  // SELLER USER
  await User.findOneAndUpdate(
    { services: { $in: service.id } },
    { $push: { getOrders: data.id } }
  );

  // SERVICE
  await Service.findOneAndUpdate(
    { slug: service.slug },
    { $push: { order: data.id } }
  );

  return res.status(200).redirect(`/user/${username}/order/${data.id}/create`);
}

exports.checkoutPostRoutes = async (req, res) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  let service = await Service.findOne({ slug: req.params.slug }).populate({
    path: 'userId',
    select: 'username profileImage',
  });

  const user = await User.findOne({ username: req.params.username });
  const buyerUser = await User.findOne({
    username: req.session.sUser.username,
  });

  if (!service || !user)
    return res.status(404).render('404', {
      title: '404',
    });

  let amount = parseInt(
    parseFloat(
      parseFloat(service.pricing.price[req.query.index]) +
        parseFloat(service.pricing.price[req.query.index] * (2.5 / 100))
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
        description: 'Sample Charge',
        currency: 'usd',
        customer: customer.id,
      })
    )
    .then((charge) => {
      // PAYMENT DONE FOR ORDER
      let order = new Order({
        service: service.id,
        user: buyerUser._id,
        charge: charge,
        stripeToken: req.body.stripeToken,
        stripeTokenType: req.body.stripeTokenType,
        stripeEmail: req.body.stripeEmail,
        status: false,
        index: req.query.index,
      });
      order
        .save()
        .then((data) => {
          // FUNCTION CALL HAPPENS FOR UPDATE USER AND SERVICE
          getUpdated(buyerUser.username, service, data, res);
        })
        .catch((err) => {
          console.log(err);
          return res.status(404).redirect('/404');
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(404).redirect('/404');
    });
};

exports.deliverOrderFilePostRoutes = async (req, res) => {
  try {
    let order = await Order.findById(req.params.orderId).populate({
      path: 'service',
      select: 'slug',
      populate: {
        path: 'userId',
        select: 'username',
      },
    });
    if (
      !order ||
      (order.service.userId.username !== req.session.sUser.username &&
        order.service.userId.username !== req.params.username)
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
    await Order.findByIdAndUpdate(order.id, {
      deliveryWork: deliverProduct,
    })
      .then(() => res.redirect(`/user/${req.session.sUser.username}/order`))
      .catch(() => res.status(404).redirect('/404'));
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.downloadDeliveryProductGetRoutes = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).render('404', {
        title: '404',
      });
    }
    const productIndex = req.params.productIndex;
    const productFilename = req.params.productFilename;
    const dir =
      path.join(__dirname, '../') + `/public/uploads/` + productFilename;

    res.set('Content-disposition', 'attachment; filename=' + productFilename);
    const setMimeType = order.deliveryWork[productIndex].mimetype;
    res.set('Content-Type', setMimeType);
    res.download(dir);
  } catch (error) {
    return res.status(404).render('404', {
      title: '404',
    });
  }
};

exports.myOrderGetRoutes = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).redirect('/404');

    let order = await Order.find({ user: user.id })
      .populate({
        path: 'service',
        select: 'serviceTitle pricing thumbnailImage slug',
        populate: {
          path: 'userId',
          select: 'username',
        },
      })
      .populate({
        path: 'user',
        select: 'username',
      });
    let getOrder = await Order.find({ _id: { $in: user.getOrders } })
      .populate({
        path: 'service',
        select: 'serviceTitle pricing thumbnailImage slug',
        populate: {
          path: 'userId',
          select: 'username',
        },
      })
      .populate({
        path: 'user',
        select: 'username',
      });

    let jobPostOrder = await JobPostOrder.find({
      _id: { $in: user.createJobPostOrders },
    })
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

    let getJobPostOrder = await JobPostOrder.find({
      _id: { $in: user.getJobPostOrders },
    })
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

    // console.log(jobPostOrder);

    return res.render('myOrder', {
      title: 'myOrder',
      order: order,
      getOrder: getOrder,
      jobPostOrder,
      getJobPostOrder,
    });
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.completeOrderPutRoutes = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate({
        path: 'service',
        select: 'serviceTitle pricing thumbnailImage slug',
        populate: {
          path: 'userId',
          select: 'username',
        },
      })
      .populate({
        path: 'user',
        select: 'username',
      });
    if (!order) {
      console.log(error);
      return res.status(404).redirect('/404');
    }

    const seller = await User.findById(order.service.userId._id);
    const earn = order.service.pricing.price[order.index];
    seller.earnings.totalEarning += earn;
    seller.earnings.totalEarning_Service += earn;

    if (!order.status) {
      await Order.findByIdAndUpdate(req.params.orderId, {
        status: true,
      });

      await User.findByIdAndUpdate(order.service.userId._id, {
        earnings: {
          totalEarning: seller.earnings.totalEarning,
          totalEarning_Service: seller.earnings.totalEarning_Service,
          totalEarning_JobPost: seller.earnings.totalEarning_JobPost,
        },
      });
    }

    // if (orderComplete.status)
    //   // await ;
    //   console.log('nooooooooo', order.service.userId);

    return res
      .status(200)
      .redirect(
        `/user/${req.session.sUser.username}/order/${req.params.orderId}/create`
      );
  } catch (error) {
    console.log(error);
    return res.status(404).redirect('/404');
  }
};

exports.sendFeedBackPostRoutes = async (req, res) => {
  const { rating, feedbacktext } = req.body;
  const sender = await User.findOne({ username: req.params.username });

  const order = await Order.findById(req.params.orderId)
    .populate({
      path: 'service',
      select: 'serviceTitle userId pricing thumbnailImage slug',
    })
    .populate({
      path: 'userId',
      select: 'username profileImage',
    });

  const receiver = order.service.userId._id;
  const service = order.service;

  if (!sender && !order) return res.status(404).redirect('/404');

  try {
    const feedback = new FeedBack({
      rating,
      feedbacktext,
      sender: sender.id,
      receiver: receiver,
      service: service.id,
      order: order.id,
    });
    const newFeedBack = await feedback.save();
    await User.findByIdAndUpdate(sender.id, {
      $push: { sentFeedBack: newFeedBack.id },
    });
    await User.findByIdAndUpdate(receiver, {
      $push: { receiveFeedBack: newFeedBack.id },
    });
    await Order.findByIdAndUpdate(order.id, {
      $push: { feedback: newFeedBack.id },
    });
    await Service.findByIdAndUpdate(service.id, {
      $push: { feedback: newFeedBack.id },
    });
    return res.status(200).redirect(`/user/${sender.username}/order`);
  } catch (error) {
    return res.status(404).redirect('/404');
  }
};

exports.earningHistoryGetRoutes = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    let order = await Order.find({ _id: { $in: user.getOrders } })
      .populate({
        path: 'service',
        select: 'serviceTitle pricing thumbnailImage slug',
        populate: {
          path: 'userId',
          select: 'username',
        },
      })
      .populate({
        path: 'user',
        select: 'username profileImage',
      });

    let jobPostOrder = await JobPostOrder.find({
      _id: { $in: user.getJobPostOrders },
    })
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

    console.log(jobPostOrder);

    return res.status(200).render('earningHistory', {
      title: 'earningHistory',
      user,
      order,
      jobPostOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).redirect('/404');
  }
};

exports.allUsersGetRoutes = async (req, res) => {
  const user = await User.find();
  return res.status(200).render('allUsers', {
    title: 'allUsers',
    user,
  });
};

exports.allMyServicesGetRoutes = async (req, res) => {
  try {
    let user = await User.findOne({
      username: req.params.username,
    });
    if (!user)
      return res.status(404).render('404', {
        title: '404',
      });
    let service = await Service.find({ userId: user.id })
      .populate({
        path: 'userId',
        select: 'username profileImage',
      })
      .sort('-createdAt');
    return res.status(200).render('allMyServices', {
      title: 'allMyServices',
      service,
      user,
    });
  } catch (error) {
    return res.status(404).render('404', {
      title: '404',
    });
  }
};

exports.allMyFeedBacksGetRoutes = async (req, res) => {
  try {
    let user = await User.findOne({
      username: req.params.username,
    });
    if (!user)
      return res.status(404).render('404', {
        title: '404',
      });
    const receiveFeedBacks = await FeedBack.find({
      _id: { $in: user.receiveFeedBack },
    })
      .populate({
        path: 'sender receiver',
        select: 'username profileImage',
      })
      .populate({
        path: 'service',
        select: 'slug',
      });
    const sentFeedBacks = await FeedBack.find({
      _id: { $in: user.sentFeedBack },
    })
      .populate({
        path: 'sender receiver',
        select: 'username profileImage',
      })
      .populate({
        path: 'service',
        select: 'slug',
      });
    return res.status(200).render('allMyFeedBacks', {
      title: 'allMyFeedBacks',
      receiveFeedBacks,
      sentFeedBacks,
    });
  } catch (error) {
    return res.status(404).render('404', {
      title: '404',
    });
  }
};

// NOTE -> LAST OF THE ALL ROUTES --> CONTROLLER
exports.allBadRoutes = async (req, res) => {
  return res.status(404).render('404', {
    title: '404',
  });
};
