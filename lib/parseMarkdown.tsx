// Parse the bolds returned by AI (in **)
const parseMarkdown = (text: string) => {
  const parts = text.split("**");
  return parts.map((part: string, i: number) =>
    i % 2 === 0 ? part : <strong key={i}>{part}</strong>
  );
};

export default parseMarkdown;
