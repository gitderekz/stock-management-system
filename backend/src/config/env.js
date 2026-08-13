require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  smtp: {
    host: process.env.CONTACTFORM_SMTP_HOSTNAME || 'smtp.gmail.com',
    port: Number(process.env.CONTACTFORM_SMTP_PORT) || 465,
    username: process.env.CONTACTFORM_SMTP_USERNAME || '',
    password: process.env.CONTACTFORM_SMTP_PASSWORD || '',
  },
};
