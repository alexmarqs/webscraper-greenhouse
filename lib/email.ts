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

export const generateEmailContent = (
  name: string,
  articlesMatched: { date: string; link: string }[]
) => {
  let messageText = '';
  let messageHtml = '';

  if (articlesMatched.length > 0) {
    messageText = `Hi my dear ${name.trim()},\n\nNew ${
      articlesMatched.length
    } articles were found matching your keywords. Please check the articles in the following date(s): ${articlesMatched
      .map(article => article.date)
      .join(', ')}\n\nBest regards,\nThe Nerd from Support team`;

    const articlesMatchedListHtml = articlesMatched
      .map(article => `<li><a href="${article.link}" target="_blank">${article.date}</a></li>`)
      .join('');

    messageHtml = `<html>
  <head>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        color: #000;
      }
      a {
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
  <div>
    <p>Hi my dear ${name},</p>
    <p>New ${articlesMatched.length} articles were found matching your keywords. Please check the following articles:
    <ul>${articlesMatchedListHtml}</ul></p>
    <p>Best regards,<br />The Nerd from Support team</p>
  </div>
  </body>
  </html>`;
  } else {
    messageText = `Hi my dear ${name.trim()},\n\nNo articles were found matching your keywords.\n\nBest regards,\nThe Nerd from Support team`;

    messageHtml = `<html>
    <head>
      <style>
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 16px;
          line-height: 1.5;
          color: #000;
        }
        a {
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
    <div>
      <p>Hi my dear ${name},</p>
      <p>No articles were found matching your keywords.</p>
      <p>Best regards,<br />The Nerd from Support team</p>
    </div>
    </body>
    </html>`;
  }

  return {
    text: messageText,
    html: messageHtml
  };
};
