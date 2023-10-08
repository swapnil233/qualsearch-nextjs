export const host = process.env.VERCEL
    ? "https://transcription-eight.vercel.app"
    : process.env.AMPLIFY_URL
        ? `${process.env.AMPLIFY_URL}`
        : "https://main.dvws5ww9zrzf5.amplifyapp.com";