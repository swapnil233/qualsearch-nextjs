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

  const response = await fetch(`${baseUrl}/api/aws/getSignedUrl?key=${uri}`);

  if (response.ok) {
    const responseData = await response.json();
    return responseData.url;
  } else {
    return null;
  }
}
