const { config } = require('dotenv');

config();

const nodeEnv = process.env.NODE_ENV || 'development';

const dev = {
  log: (msg) => {
    if (nodeEnv === 'development') {
      console.log(msg);
    }
  },
};

module.exports = dev;
