const Message = require('../models/messageModel');
const User = require('../models/userModel');

exports.messageGetRoutes = async (req, res) => {
  try {
    const receiver = await User.findOne({
      username: req.params.receiver,
    });
    let msg = await Message.find({
      $or: [
        {
          $and: [
            { receiver: req.params.receiver },
            { sender: req.params.username },
          ],
        },
        {
          $and: [
            { receiver: req.params.username },
            { sender: req.params.receiver },
          ],
        },
      ],
    });

    let receiverExists = await User.findOne({
      username: req.params.username,
      messageReceivers: req.params.receiver,
    });
    if (!receiverExists && receiver && req.params.username !== req.params.receiver)
      await User.findOneAndUpdate(
        { username: req.params.username },
        { $push: { messageReceivers: req.params.receiver } }
      );

    let senderExists = await User.findOne({
      username: req.params.receiver,
      messageReceivers: req.params.username,
    });

    if (!senderExists && receiver && req.params.username !== req.params.receiver)
      await User.findOneAndUpdate(
        { username: req.params.receiver },
        { $push: { messageReceivers: req.params.username } }
      );


    // let senderAllMsgs = await Message.find({
    //   $or: [{ sender: req.params.username }, {receiver: req.params.username }],
    // });

    // console.log(senderAllMsgs);

    let uniqueReceiver = await User.findOne({ username: req.params.username });
    // console.log(uniqueReceiver);
    let allReceiverDetails = await User.find({
      username: uniqueReceiver.messageReceivers,
    });

    console.log(allReceiverDetails);

    return res.status(200).render('message', {
      title: 'message',
      sender: req.params.username,
      receiver: receiver,
      msg: msg,
      allReceiverDetails: allReceiverDetails,
      uniqueReceiver: uniqueReceiver.messageReceivers,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).redirect('/404');
  }
};
