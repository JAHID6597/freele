const methodOverride = require('method-override');
const session = require('express-session');
const connectDB = require('./database/connection');
const dotenv = require('dotenv');
const bodyparser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const router = require('./routes/router');
const express = require('express');
const app = express();

const setLocals = require('./middleware/setLocals');
const Message = require('./models/messageModel');

const http = require('http');
const server = http.Server(app);
const socketIO = require('socket.io');
const io = socketIO(server);

app.use(express.json());

// METHOD_OVERRIDE
app.use(methodOverride('_method'));

// MORGAN
app.use(morgan('tiny'));

// BODY-PARSER
app.use(bodyparser.urlencoded({ extended: true }));

// DOTENV
dotenv.config({ path: 'config.env' });

// EJS
app.set('view engine', 'ejs');

// Assets
app.use(
  '/bootstrap',
  express.static(path.resolve(__dirname, './node_modules/bootstrap/dist'))
);

app.use(
  '/fontawesome',
  express.static(
    path.resolve(__dirname, './node_modules/@fortawesome/fontawesome-free')
  )
);

app.use(
  '/file-upload-with-preview',
  express.static(
    path.resolve(__dirname, './node_modules/file-upload-with-preview/dist')
  )
);

app.use('/public', express.static(path.resolve('./public')));

// EXPRESS SESSION
const store = require('./database/session');
const User = require('./models/userModel');

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// SET LOCALS
app.use(setLocals);

// SOCKET
let chatUsers = {};
io.on('connection', (socket) => {
  socket.on('user-connected', async (senderUserName) => {
    chatUsers[senderUserName] = socket.id;
    console.log('p', chatUsers);
    let senderAllMsgs = await Message.find({
      sender: senderUserName,
    });
    // console.log(senderAllMsgs);

    // for (let i = 0; i < senderAllMsgs.length; i++) {
    //   let uniqueReceiverExists = await User.findOne({
    //     username: senderUserName,
    //     messageReceivers: senderAllMsgs[i].receiver,
    //   });

    //   if (!uniqueReceiverExists)
    //     await User.findOneAndUpdate(
    //       { username: senderUserName },
    //       { $push: { messageReceivers: senderAllMsgs[i].receiver } }
    //     );
    // }

    // let uniqueReceiver = await User.findOne({
    //   username: senderUserName
    // })
    // console.log(uniqueReceiver.messageReceivers);
    // socket.emit("find-receiver", uniqueReceiver.messageReceivers);
  });

  socket.on('send-message', async function (data) {
    let sender = data.sender;
    let receiver = chatUsers[data.receiver];
    let message = data.messageBody;

    let msg = new Message({
      sender: sender,
      receiver: data.receiver,
      messageBody: message,
    });
    await msg.save();

    let uniqueReceiverExists = await User.findOne({
      username: msg.sender,
      messageReceivers: msg.receiver,
    });

    if (!uniqueReceiverExists)
      await User.findOneAndUpdate(
        { username: msg.sender },
        { $push: { messageReceivers: msg.receiver } }
      );

    let uniqueReceiver = await User.findOne({
      username: msg.sender,
    });

    uniqueReceiverExists = await User.findOne({
      username: msg.receiver,
      messageReceivers: msg.sender,
    });

    uniqueReceiver = await User.findOne({
      username: msg.receiver,
    });

    uniqueReceiverExists = await User.findOne({
      username: msg.sender,
      messageReceivers: msg.receiver,
    });

    socket.to(receiver).emit('send-specific-user', {
      sender: sender,
      receiver: data.receiver,
      messageBody: message,
    });
  });

  socket.on('user-selected', async (data) => {
    console.log(data);
    let msg = await Message.find({
      $or: [
        { $and: [{ receiver: data.receiver }, { sender: data.sender }] },
        { $and: [{ receiver: data.sender }, { sender: data.receiver }] },
      ],
    });
    socket.emit('receiver-user-selected', msg);
  });
});

// MONGODB CONNECTION
connectDB();

// ROOT ROUTE
app.use('/', router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listen On PORT ${PORT}`));
