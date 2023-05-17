import { applyMiddlewares } from '../../lib/middlewares';
import { EMAILS_TO_NOTIFY, KEYWORDS, WEBSITE_URL } from '../../lib/env';
import { combineText, scannerKeywordsRegex } from '../../lib/parser';
import { load as cheerioLoad } from 'cheerio';
import { sendTransactionalEmail } from '../../lib/email';
import { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (_request: VercelRequest, response: VercelResponse) => {
  console.log('Starting Cron job!');

  const res = await fetch(WEBSITE_URL);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${WEBSITE_URL}`);
  }

  const htmlText = await res.text();

  const $ = cheerioLoad(htmlText);

  const articles =
    $('#mlkFrame .register.bootstrapScopedWS')
      .map((_, el) => {
        const title = $(el).find('.register-title').text();
        const description = $(el).find('.register-text').text();
        const date = $(el).find('.register-date').text();
        return { title, description, date };
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
    .map(article => article.date);

  if (articlesMatched.length > 0) {
    const users = EMAILS_TO_NOTIFY?.split(',') || [];

    const promises = users.map(user => {
      const [name, email] = user.split(':');

      const message = `Hi my dear ${name.trim()},\n\nNew articles were found matching your keywords. Please check the articles in the following date(s): ${articlesMatched.join(
        ', '
      )}\n\nBest regards,\nThe Nerd from Support team`;

      return sendTransactionalEmail(
        email.trim(),
        'New articles found matching your keywords',
        message
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
