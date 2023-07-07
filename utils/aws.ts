export async function getSignedUrl(uri: string): Promise<string | null> {
  const baseUrl = process.env.VERCEL_URL
    ? "https://" + process.env.VERCEL_URL
    : "http://localhost:3003";

  const response = await fetch(`${baseUrl}/api/aws/getSignedUrl?key=${uri}`);

  if (response.ok) {
    const responseData = await response.json();
    return responseData.url;
  } else {
    return null;
  }
}
