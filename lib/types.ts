// Data types

export type Article = {
  title: string;
  description: string;
  date: string;
};

// Ports

export type Cache = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<string | null>;
};

export type EmailService = {
  sendTransactional(to: string, subject: string, text: string, html?: string): Promise<void>;
};

// Use cases
export type UseCase<Request, Response> = (request: Request) => Promise<Response>;

export type WebsiteScrappingUseCaseRequest = {
  url: string;
  keywords: string;
  emailsToNotify: string;
};

export type WebsiteScrappingUseCaseResponse = {
  articlesMatched: {
    date: string;
    link: string;
  }[];
  message: string;
};
