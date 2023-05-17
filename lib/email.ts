import nodemailer from 'nodemailer';
import postmarkTransport from 'nodemailer-postmark-transport';
import { POSTMARK_API_KEY, SENDER_EMAIL_NAME } from './env';

const transport = nodemailer.createTransport(
  postmarkTransport({
    auth: {
      apiKey: POSTMARK_API_KEY
    }
  })
);

export const sendTransactionalEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  await transport.sendMail({
    from: SENDER_EMAIL_NAME,
    to: to,
    subject: subject,
    text: text,
    html: html,
    messageStream: 'outbound'
  });
};
