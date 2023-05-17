import { API_KEY } from './env';
import { VercelRequest, VercelResponse } from '@vercel/node';

const withMethodAllowed = (
  handler: (request: VercelRequest, response: VercelResponse) => Promise<VercelResponse>
) => {
  return async (request: VercelRequest, response: VercelResponse) => {
    if (request.method !== 'GET') {
      return response.status(405).send('Method not allowed');
    }

    return handler(request, response);
  };
};

const withApiKey = (
  handler: (request: VercelRequest, response: VercelResponse) => Promise<VercelResponse>
) => {
  return async (request: VercelRequest, response: VercelResponse) => {
    const apiKey = request.query?.['API_KEY'];

    if (apiKey !== API_KEY) {
      return response.status(401).send('Unauthorized');
    }

    return handler(request, response);
  };
};

const withGlobalErrorHandler = (
  handler: (request: VercelRequest, response: VercelResponse) => Promise<VercelResponse>
) => {
  return async (request: VercelRequest, response: VercelResponse) => {
    try {
      await handler(request, response); // This is where the actual handler is called
    } catch (error) {
      console.log('Cron job error -->', error);
      return response.status(500).send('Internal server error');
    }
  };
};

export const applyMiddlewares = (
  handler: (request: VercelRequest, response: VercelResponse) => Promise<VercelResponse>
) => {
  return withGlobalErrorHandler(withApiKey(withMethodAllowed(handler)));
};
