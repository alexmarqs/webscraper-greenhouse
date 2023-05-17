# Websrapper Green House API

Webscrapper to check if the Green House (energetic candidature) is already available.

## API Endpoints

- `/api/cron/greenhouse` - Web scrapper to check if the Green House is already available, if so, it will send a notification. Pass a request parameter `?API_KEY=<your secret>` to authenticate the request.

## Tech Stack

- [Vercel](https://vercel.com/) - Serverless Functions (in this case I'm using and Edge Function)
- [Cheerio](https://cheerio.js.org/) - Web scrapping (to parse HTML)
- [Vercel Cron Jobs](https://vercel.com/blog/cron-jobs) - Cron jobs
- [Zod](https://zod.dev) - Type validation for the environment variables
- [NodeMailer](https://nodemailer.com/about/) - Send emails
- [Postmark](https://postmarkapp.com/) - Email service (in combination with NodeMailer)

## Archictecture

TBD

## Run Locally

```bash
vercel dev
```

You need to have `vercel` installed globally. To expose to the API locally to the outside world,
you can use [ngrok](https://ngrok.com/).

## Deploy to production

```bash
vercel deploy --prod
```

## Possible TODOs

- [ ] Add tests (using vitest or jest)
