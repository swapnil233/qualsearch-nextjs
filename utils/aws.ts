import { host } from "./host";

export async function getSignedUrl(uri: string): Promise<string | null> {
  const response = await fetch(`${host}/api/aws/getSignedUrl?key=${uri}`);

  if (response.ok) {
    const responseData = await response.json();
    return responseData.url;
  } else {
    console.error("Error fetching AWS signed URL", response);
    return null;
  }
}
