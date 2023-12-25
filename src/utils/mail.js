const nodeMailer = require('nodemailer');
const { config } = require('dotenv');
const dev = require('./log');

config();

const user = process.env.GMAIL || '';

const pass = process.env.GMAIL_PASSWORD || '';
const host = process.env.GMAIL_HOST || '';
const port = Number(process.env.GMAIL_PORT) || '';

const transporter = nodeMailer.createTransport({
  host,
  port,
  secure: true,
  auth: {
    user,
    pass,
  },
});

function sendMail(options) {
  const mailOptions = {
    from: 'admin@warp.dev',
    to: options.receipient,
    subject: options.subject,
    text: options.content,
  };

  let result = false;
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error.message);
    } else {
      result = true;
      dev.log('Email sent: ' + info.response);
    }
  });

  return result;
}

module.exports = sendMail;
