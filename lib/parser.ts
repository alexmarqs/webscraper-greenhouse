import regexEscape from 'escape-string-regexp';
import { Article } from './types';

export const scannerKeywordsRegex = (keywords: string[]) => {
  const boundaries = keywords.map(keyword => `\\b${regexEscape(keyword.trim())}\\b`);
  const scanner = new RegExp(`(${boundaries.join(')|(')})`, 'gi');

  return scanner;
};

export function combineText(article: Article) {
  let text = '';

  if (article.title) {
    text += `${article.title}\n`;
  }

  if (article.description) {
    text += `${article.description}\n`;
  }

  if (article.date) {
    text += `${article.date}\n`;
  }

  return text;
}
