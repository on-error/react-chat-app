const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const socket = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');

const app = express();

require('dotenv').config();

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());
webpush.setVapidDetails(
  'mailto:yoboicool7@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.use('/api/auth', userRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/subscribe', (req, res) => {
  const subscription = req.body;

  res.status(201).json({});

  const payload = JSON.stringify({ title: 'Here is my first notification!!' });

  webpush
    .sendNotification(subscription, payload)
    .catch((err) => console.err(err));
});

const dblink =
  'mongodb+srv://admin:uWesKLF5ynQjX3Fc@cluster0.ind2od4.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(dblink, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on PORT ${process.env.PORT}`);
});

const io = socket(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on('connection', (socket) => {
  global.chatSocket = socket;
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('userId', onlineUsers);
  });

  socket.on('send-msg', (data) => {
    const sendUserSocket = global.onlineUsers.get(data.to);
    console.log('send-msg', onlineUsers, data);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-receive', data.message);
    }
  });
});
