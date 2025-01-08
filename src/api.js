const express = require('express');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require('nodemailer');
const serverless = require('serverless-http');

const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    hello: 'hi!',
  });
});

router.post('/formSubmit', async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body.data;

  const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    secureConnection: true,
    port: 587,
    auth: {
      user: process.env.EMAIL_ADDRESS_FROM, // Replace with your email
      pass: process.env.EMAIL_PASSWORD, // Replace with your email password
    },
  });

  const mailOptionsToDava = {
    from: process.env.EMAIL_ADDRESS_FROM,
    to: process.env.EMAIL_ADDRESS_TO,
    subject: `New contact request from: ${firstName} ${lastName}`,
    text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n${
      phone !== '' ? 'Phone: ' + phone : ''
    }\n${message !== '' ? 'Message: \n\n' + message : ''}
    `,
  };
  const mailOptionsToRequester = {
    from: process.env.EMAIL_ADDRESS_FROM,
    to: email,
    subject: `Auto-Reply From Yardhouse Transportation`,
    text: `Hello ${firstName},\n\nThank you for reaching out. \n\nA member of our team will get back to you as soon as possible. \n\nFor a faster response, you may text us or call us at: (404) 772-5167.`,
  };

  Promise.all([
    transporter.sendMail(mailOptionsToDava),
    transporter.sendMail(mailOptionsToRequester),
  ])
    .then((response) => {
      res.status(200).send('success');
      console.log(response);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ error: 'Email sending failed', details: err.message });
      console.log(err);
    });
});

app.use('/.netlify/functions/api', router);

module.exports = app;
module.exports.handler = serverless(app);
