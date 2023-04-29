const messagesModel = require('../model/messagesModel');
const webpush = require('web-push');

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await messagesModel.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    if (data) return res.json({ msg: 'Message added successfully' });
    return res.json({ msg: 'Failed to add message to the database' });
  } catch (err) {
    next(err);
  }
};

module.exports.getAllMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    console.log(req.body);
    const messages = await messagesModel
      .find({
        users: {
          $all: [from, to],
        },
      })
      .sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });

    res.json(projectedMessages);
  } catch (err) {
    next(err);
  }
};

module.exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const messages = await messagesModel.find({
      'users.1': userId,
      isNotified: false,
    });

    await messagesModel.updateMany(
      {
        'users.1': userId,
        isNotified: false,
      },
      { isNotified: true }
    );

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

module.exports.notify = async (req, res, next) => {
  try {
    const subscription = req.body.subscription;
    const title = req.body.payload;

    res.status(201).json({});

    const payload = JSON.stringify({
      title,
    });
    console.log(';', payload);
    webpush
      .sendNotification(subscription, payload)
      .catch((err) => console.err(err));
  } catch (err) {
    next(err);
  }
};

module.exports.markNotified = async (req, res, next) => {
  try {
    const messages = await messagesModel.updateMany(
      {
        isNotified: false,
      },
      { isNotified: true }
    );

    res.json({ messages });
  } catch (err) {
    next(err);
  }
};
