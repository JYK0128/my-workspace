import nodemailer from 'nodemailer';


export const mailer = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.APP_MAIL_USER,
    clientId: process.env.APP_MAIL_ID,
    clientSecret: process.env.APP_MAIL_SECRET,
    refreshToken: process.env.APP_MAIL_REFRESH,
  },
});
