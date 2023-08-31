export default function convertToTimestamp(numericTimestamp: number): string {
  // Calculate minutes and seconds
  const minutes = Math.floor(numericTimestamp / 60);
  const seconds = Math.round(numericTimestamp % 60);

  // Convert to strings and pad with zero if needed
  const minutesStr = String(minutes);
  const secondsStr = seconds < 10 ? "0" + String(seconds) : String(seconds);

  return `${minutesStr}:${secondsStr}`;
}
