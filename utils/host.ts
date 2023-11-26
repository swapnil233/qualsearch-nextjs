export const host = process.env.VERCEL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.AMPLIFY_URL
    ? `${process.env.AMPLIFY_URL}`
    : "https://main.dvws5ww9zrzf5.amplifyapp.com";
