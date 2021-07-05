const express = require('express');
const router = express.Router();

const controller = require('../controllers/controller');
const messageController = require('../controllers/messageController');
const jobPostController = require('../controllers/jobPostController');
const adminController = require('../controllers/adminController');

const { signUpFormValidation } = require('../middleware/signUpFormValidation');
const { signInFormValidation } = require('../middleware/signInFormValidation');
const {
  editProfileFormValidation,
} = require('../middleware/editProfileFormValidation');

const isAuthenticated = require('../middleware/isAuthenticated');
const isAuthenticatedAdmin = require('../middleware/isAuthenticatedAdmin');
const authenticatedAfterLogin = require('../middleware/authenticatedAfterLogin');

const upload = require('../middleware/multerUploads');
const isAuthForOrder = require('../middleware/isAuthForOrder');

// RENDER HOME PAGE
router.get('/', controller.homeRoutes);

// RENDER SIGNIN PAGE
router.get('/signin', [authenticatedAfterLogin], controller.signInGetRoutes);

// RENDER SIGNUP PAGE
router.get('/signup', [authenticatedAfterLogin], controller.signUpGetRoutes);

// RENDER PROFILE PAGE
router.get('/user/:username', controller.profileGetRoutes);

// RENDER EDIT PROFILE PAGE
router.get(
  '/user/edit/:username',
  [isAuthenticated],
  controller.editProfileGetRoutes
);

// RENDER UPLOAD SERVICE PAGE
router.get(
  '/user/:username/create_service',
  controller.createNewServiceGetRoutes
);

// RENDER SINGLE SERVICE PAGE
router.get('/user/:username/service/:slug', controller.singleServiceGetRoutes);

// RENDER SINGLE SERVICE EDIT PAGE
router.get(
  '/user/:username/service/:slug/edit',
  [isAuthenticated],
  controller.singleServiceEditGetRoutes
);

// SIGNIN API
router.post('/signin', [signInFormValidation], controller.signInPostRoutes);

// SIGNUP API
router.post('/signup', [signUpFormValidation], controller.signUpPostRoutes);

// LOGOUT API
router.get('/logout', controller.logOutRoutes);

// EDIT PROFILE API
router.put(
  '/user/edit/:username',
  [isAuthenticated, upload.single('profileImage'), editProfileFormValidation],
  controller.editProfilePutRoutes
);

// UPLOAD SERVICE API
router.post(
  '/user/:username/create_service',
  [isAuthenticated, upload.single('thumbnailImage')],
  controller.createNewServicePostRoutes
);

// GET ALL SERVICES
router.get('/allservices', controller.allServicesGetRoutes);

// EDIT SERVICE API
router.put(
  '/user/:username/service/:slug/edit',
  [isAuthenticated, upload.single('thumbnailImage')],
  controller.editServicesPutRoutes
);

// DELETE SERVICE API
router.get(
  '/user/:username/service/:slug/delete',
  [isAuthenticated],
  controller.deleteServiceGetRoutes
);

// SEARCH SERVICE API
router.get('/search', controller.searchServiceGetRoutes);

// CHECKOUT
router.get(
  '/user/:username/service/:slug/checkout',
  [isAuthForOrder],
  controller.checkoutGetRoutes
);

// SERVICE ORDER CHECKOUT API
router.post(
  '/user/:username/service/:slug/charge',
  [isAuthForOrder],
  controller.checkoutPostRoutes
);

// RENDER ORDER PAGE
router.get(
  '/user/:username/order/:orderId/create',
  [isAuthenticated],
  controller.orderGetRoutes
);

// RENDER ORDER DELIVERY PAGE
router.get(
  '/user/:username/order/:orderId/delivery',
  [isAuthenticated],
  controller.orderDeliveryGetRoutes
);

// DELIVRY ORDER API
router.post(
  '/user/:username/order/:orderId/delivery/done',
  [isAuthenticated, upload.array('delivery', 10)],
  controller.deliverOrderFilePostRoutes
);

// RENDER MY ORDER PAGE
router.get(
  '/user/:username/order',
  [isAuthenticated],
  controller.myOrderGetRoutes
);

// DOWNLOAD DELIVERY PRODUCT
router.get(
  '/user/:username/order/:orderId/download/:productFilename/:productIndex',
  [isAuthenticated],
  controller.downloadDeliveryProductGetRoutes
);

// COMPLETE ORDER API
router.put(
  '/user/:username/order/:orderId/completeorder',
  [isAuthenticated],
  controller.completeOrderPutRoutes
);

// SEND FEEDBACK
router.post(
  '/user/:username/order/:orderId/feedback',
  [isAuthenticated],
  controller.sendFeedBackPostRoutes
);

// RENDER MESSAGE PAGE
router.get(
  '/messages/:username/:receiver',
  [isAuthenticated],
  messageController.messageGetRoutes
);
router.get(
  '/messages/:username',
  [isAuthenticated],
  messageController.messageGetRoutes
);

// RENDER POST REQUEST
router.get(
  '/user/:username/post_request',
  [isAuthenticated],
  jobPostController.postRequestGetRoutes
);

// GET ALL MY(SINGLE USER) JOB POSTS
router.get(
  '/user/:username/allMyJobPost',
  jobPostController.allMyJobPostGetRoutes
);

// POST REQUEST API
router.post(
  '/user/:username/post_request',
  [isAuthenticated, upload.array('attachFiles', 10)],
  jobPostController.postRequestPostRoutes
);

// Delete POST REQUEST
router.get(
  '/user/:username/post_request/:jobPostId/delete',
  [isAuthenticated],
  jobPostController.postRequestDeleteGetRoutes
);

// RENDER Edit POST REQUEST
router.get(
  '/user/:username/post_request/:jobPostId/edit',
  [isAuthenticated, upload.array('attachFiles', 10)],
  jobPostController.postRequestEditGetRoutes
);

// EDIT POST REQUEST API
router.put(
  '/user/:username/post_request/:jobPostId/edit',
  [isAuthenticated, upload.array('attachFiles', 10)],
  jobPostController.postRequestEditPutRoutes
);

// fetch check offer
router.get(
  '/alljobpost/:username/checkoffer/:jobPostId',
  [isAuthenticated],
  jobPostController.checkJobPostRequestOfferControlGetRoutes
);

// DOWNLOAD DELIVERY PRODUCT
router.get(
  '/user/:username/allMyJobPost/download',
  jobPostController.downloadJobPostAttachFilesGetRoutes
);

// RENDER ALL JOB POSTS
router.get('/alljobpost', jobPostController.allJobPostGetRoutes);

// SENT POST REQUEST API
router.put(
  '/user/:username/:jobPostId/post_request/sent',
  [isAuthenticated],
  jobPostController.postRequestSentPutRoutes
);

// DELETE JOB POST GET REQUEST API
router.get(
  '/user/:username/:jobPostId/:postRequestId/post_request/remove',
  [isAuthenticated],
  jobPostController.postRequestRemoveGetRoutes
);

// RENDER POST CHECKOUT
router.get(
  '/user/:username/jobpost/:jobPostId/:requestId/checkout',
  [isAuthenticated],
  jobPostController.jobPostCheckoutGetRoutes
);

// JOBPOST ORDER CHECKOUT API
router.post(
  '/user/:username/jobpost/:jobPostId/:requestId/charge',
  [isAuthForOrder],
  jobPostController.jobPostCheckoutChargePostRoutes
);

// RENDER JOBPOST ORDER PAGE
router.get(
  '/user/:username/jobPostOrder/:jobPostOrderId/create',
  [isAuthenticated],
  jobPostController.jobPostOrderGetRoutes
);

// RENDER JOBPOST ORDER DELIVERY PAGE
router.get(
  '/user/:username/jobPostOrder/:jobPostOrderId/delivery',
  [isAuthenticated],
  jobPostController.jobPostOrderDeliveryGetRoutes
);

// JOB POST ORDER DELIVER API
router.post(
  '/user/:username/jobPostOrder/:jobPostOrderId/delivery/done',
  [isAuthenticated, upload.array('delivery', 10)],
  jobPostController.deliverJobPostOrderFilePostRoutes
);

// JOB POST ORDER DELIVERY PRODUCT DOWNLOAD
router.get(
  '/user/:username/jobPostOrder/:jobPostOrderId/download/:productFilename/:productIndex',
  [isAuthenticated],
  jobPostController.downloadJobPostOrderDeliveryProductGetRoutes
);

// JOB POST ORDER COMPLETE ROUTES
router.put(
  '/user/:username/jobPostOrder/:jobPostOrderId/completeorder',
  [isAuthenticated],
  jobPostController.completeJobPostOrderPutRoutes
);

// RENDER ADMIN DASHBOARD PAGE
router.get(
  '/admin/:username/dashboard',
  [isAuthenticatedAdmin],
  adminController.adminDashboardGetRoutes
);

// RENDER PAYMENT HISTORY PAGE
router.get(
  '/user/:username/earning_history',
  [isAuthenticated],
  controller.earningHistoryGetRoutes
);

// RENDER ALL USERS PAGE
router.get('/allusers', controller.allUsersGetRoutes);

// RENDER ALL MY SERVICES
router.get('/user/:username/allmyservices', controller.allMyServicesGetRoutes);

// RENDER ALL MY FEEDBACKS
router.get('/user/:username/feedbacks', controller.allMyFeedBacksGetRoutes);

// ALL BAD REQUEST ROUTES
// NOTE -> LAST OF THE ALL ROUTES
router.get('*', controller.allBadRoutes);

module.exports = router;
