export default function timeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.abs((now.getTime() - date.getTime()) / 1000);

  const days = Math.floor(diffInSeconds / 86400);
  const hours = Math.floor(diffInSeconds / 3600) % 24;
  const minutes = Math.floor(diffInSeconds / 60) % 60;

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
}
