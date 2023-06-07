import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_TOKEN, UPSTASH_REDIS_URL } from '../../env';
import { Cache } from '../../types';

const redis = new Redis({
  url: UPSTASH_REDIS_URL,
  token: UPSTASH_REDIS_TOKEN
});

const get = (key: string) => {
  return redis.get<string>(key);
};

const set = (key: string, value: string) => {
  return redis.set(key, value);
};

export const cache: Cache = {
  get,
  set
};
