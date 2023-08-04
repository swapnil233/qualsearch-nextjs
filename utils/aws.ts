export async function getSignedUrl(uri: string): Promise<string | null> {
  // Get the base URL for the API
  const baseUrl = process.env.VERCEL_URL
    ? process.env.VERCEL_URL
    : process.env.AMPLIFY_URL
    ? process.env.AMPLIFY_URL
    : "http://localhost:3003";

  const response = await fetch(`${baseUrl}/api/aws/getSignedUrl?key=${uri}`);

  if (response.ok) {
    const responseData = await response.json();
    return responseData.url;
  } else {
    return null;
  }
}
