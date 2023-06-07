import { applyMiddlewares } from '../../lib/middlewares';
import { EMAILS_TO_NOTIFY, KEYWORDS, WEBSITE_URL } from '../../lib/env';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { emailService } from '../../lib/adapters/email/nodemailer-postmark';
import { cache } from '../../lib/adapters/cache/upstash';
import { makeWebsiteScrapingUseCase } from '../../lib/use-cases/makeWebsiteScrapingUseCase';

const handler = async (_request: VercelRequest, response: VercelResponse) => {
  console.log('Starting Cron job!');

  const useCase = makeWebsiteScrapingUseCase(cache, emailService);

  const responseFromUseCase = await useCase({
    url: WEBSITE_URL,
    keywords: KEYWORDS,
    emailsToNotify: EMAILS_TO_NOTIFY
  });

  console.log('Cron job done!');
  return response.status(200).send(responseFromUseCase.message);
};

export default applyMiddlewares(handler);
