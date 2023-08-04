export async function getSignedUrl(uri: string): Promise<string | null> {
  // Get the base URL for the API
  let baseUrl = '';
  if (process.env.VERCEL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.AMPLIFY) {
    baseUrl = process.env.AMPLIFY_URL!;
  } else {
    baseUrl = 'http://localhost:3003';
  }

  console.log("VERCEL:", process.env.VERCEL)
  console.log("VERCEL_URL:", process.env.VERCEL_URL)
  console.log("AMPLIFY:", process.env.AMPLIFY)
  console.log("AMPLIFY_URL:", process.env.AMPLIFY_URL)

  const response = await fetch(`https://main.dvws5ww9zrzf5.amplifyapp.com/api/aws/getSignedUrl?key=${uri}`);

  if (response.ok) {
    const responseData = await response.json();
    return responseData.url;
  } else {
    return null;
  }
}
