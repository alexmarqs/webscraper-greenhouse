import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_TOKEN, UPSTASH_REDIS_URL } from './env';

const redis = new Redis({
  url: UPSTASH_REDIS_URL,
  token: UPSTASH_REDIS_TOKEN
});

export const getLatestArticleCheckedFromCache = () => {
  return redis.get<string>('latest_article_checked');
};

export const setLatestArticleCheckedToCache = (value: string) => {
  return redis.set('latest_article_checked', value);
};
