import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * Wraps the web export's <html> document (only used when running `expo export
 * --platform web` / `expo start --web` — no effect on iOS/Android). Adds the
 * meta tags a marketing/landing web build would want for link previews and
 * search; the native apps don't need this at all.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  const title = 'CODE — брендовая одежда, обувь и сумки из аутлетов Кореи';
  const description =
    'CODE — маркетплейс оригинальных кроссовок, одежды и сумок из аутлетов Южной Кореи со скидками от 30–40%. Доставка в Казахстан и страны СНГ.';

  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#FAF8F6" />

        <title>{title}</title>
        <meta name="description" content={description} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/assets/icon.png" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
