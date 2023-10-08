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
          <span key={index} style={{ backgroundColor: "yellow" }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
