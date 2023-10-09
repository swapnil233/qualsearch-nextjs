import { Mark } from "@mantine/core";

export default function HighlightSearch({
  text,
  search,
}: {
  text: string;
  search: string;
}) {
  if (!search) return <>{text}</>;

  const parts = text.split(new RegExp(`(${search})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <Mark key={index}>{part}</Mark>
        ) : (
          part
        )
      )}
    </>
  );
}
