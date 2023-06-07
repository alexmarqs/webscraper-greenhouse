import { generateEmailContent } from '../adapters/email/utils';
import { combineText, scannerKeywordsRegex } from '../parser';
import {
  Cache,
  EmailService,
  UseCase,
  WebsiteScrappingUseCaseRequest,
  WebsiteScrappingUseCaseResponse
} from '../types';
import { load as cheerioLoad } from 'cheerio';

export const makeWebsiteScrappingUseCase = (
  cache: Cache,
  emailService: EmailService
): UseCase<WebsiteScrappingUseCaseRequest, WebsiteScrappingUseCaseResponse> => {
  return async (request: WebsiteScrappingUseCaseRequest) => {
    // SCRAPPING

    // as I'm using node 18.x, I can use fetch directly without installing any package
    const res = await fetch(request.url);

    if (!res.ok) {
      throw new Error(`Failed to fetch ${request.url}`);
    }

    const htmlText = await res.text();

    // PARSING

    const $ = cheerioLoad(htmlText);

    const websiteOrigin = new URL(request.url).origin;

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
    const lastArticleDateInDb = await cache.get('latest_article_checked');

    if (lastArticleDateInDb && lastArticleDate === lastArticleDateInDb) {
      return {
        articlesMatched: [],
        message: 'No new articles found to analyze from the last time the job ran'
      };
    }

    const latestArticles = lastArticleDateInDb
      ? articles.filter(article => {
          const articleDate = new Date(article.date);
          const lastArticleDateInDbDate = new Date(lastArticleDateInDb);
          return articleDate > lastArticleDateInDbDate;
        })
      : articles;

    // SCANNING:

    const articlesMatched = latestArticles
      .filter(article =>
        scannerKeywordsRegex(request.keywords.split(',')).test(combineText(article))
      )
      .map(article => {
        return { date: article.date, link: article.link };
      });

    // update the latest article checked in the cache
    await cache.set('latest_article_checked', lastArticleDate);

    // NOTIFICATION:

    const users = request.emailsToNotify.split(',') || [];

    const promises = users.map(user => {
      const [name, email] = user.split(':');

      const { text, html } = generateEmailContent(name.trim(), articlesMatched);

      return emailService.sendTransactional(
        email.trim(),
        articlesMatched.length === 0
          ? 'No articles found matching your keywords'
          : `Found ${articlesMatched.length} new articles matching your keywords`,
        text,
        html
      );
    });

    await Promise.all(promises);

    return {
      articlesMatched,
      message: `Found ${articlesMatched.length} new articles matching your keywords`
    };
  };
};
