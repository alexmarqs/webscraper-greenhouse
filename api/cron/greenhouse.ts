import { applyMiddlewares } from '../../lib/middlewares';
import { EMAILS_TO_NOTIFY, KEYWORDS, WEBSITE_URL } from '../../lib/env';
import { combineText, scannerKeywordsRegex } from '../../lib/parser';
import { load as cheerioLoad } from 'cheerio';
import { generateEmailContent, sendTransactionalEmail } from '../../lib/email';
import { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (_request: VercelRequest, response: VercelResponse) => {
  console.log('Starting Cron job!');

  // as I'm using node 18.x, I can use fetch directly without installing any package
  const res = await fetch(WEBSITE_URL);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${WEBSITE_URL}`);
  }

  const htmlText = await res.text();

  const $ = cheerioLoad(htmlText);

  const websiteOrigin = new URL(WEBSITE_URL).origin;

  const articles =
    $('.register')
      .map((_, el) => {
        const title = $(el).find('.register-title').text();
        const link = `${websiteOrigin}/${$(el).find('.register-title a').attr('href')}`;
        const description = $(el).find('.register-text').text();
        const date = $(el).find('.register-date').text();

        return { title, description, date, link };
      })
      .get() || [];

  const lastArticleDate = articles[0].date;
  const lastArticleDateInDb: string | undefined = undefined;

  if (lastArticleDateInDb && lastArticleDate === lastArticleDateInDb) {
    console.log('Cron job done! No new articles found to analyze from the last time the job ran');
    return response
      .status(200)
      .send('Cron job done! No new articles found to analyze from the last time the job ran');
  }

  const latestArticles = lastArticleDateInDb
    ? articles.filter(article => {
        const articleDate = new Date(article.date);
        const lastArticleDateInDbDate = new Date(lastArticleDateInDb);
        return articleDate > lastArticleDateInDbDate;
      })
    : articles;

  const articlesMatched = latestArticles
    .filter(article => scannerKeywordsRegex(KEYWORDS.split(',')).test(combineText(article)))
    .map(article => {
      return { date: article.date, link: article.link };
    });

  if (articlesMatched.length > 0) {
    const users = EMAILS_TO_NOTIFY?.split(',') || [];

    const promises = users.map(user => {
      const [name, email] = user.split(':');

      const { text, html } = generateEmailContent(name.trim(), articlesMatched);

      return sendTransactionalEmail(
        email.trim(),
        `New articles ${articlesMatched.length} found matching your keywords`,
        text,
        html
      );
    });

    await Promise.all(promises);

    console.log('Cron job done! Users were notified!');
    return response.status(200).send('Users were notified!');
  }

  console.log('Cron job done! No articles matched the keywords');
  return response.status(200).send('No articles matched the keywords');
};

export default applyMiddlewares(handler);
