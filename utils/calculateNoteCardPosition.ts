import { RefObject } from "react";

/**
 * Calculate the position of a note based on the start and end times of the selected text.
 *
 * @param {number} start - The start time of the selected text.
 * @param {number} end - The end time of the selected text.
 * @param {RefObject<HTMLDivElement>} transcriptRef - The transcript ref.
 * @returns { {top: number, left: number} | null } The position object containing 'top' and 'left' coordinates of the note or null if the start and end elements are not found.
 */
export const calculateNoteCardPosition = (
  start: number,
  end: number,
  transcriptRef: RefObject<HTMLDivElement>
): { top: number; left: number } | null => {
  // Find the start and end elements based on data attributes.
  const startElement = Array.from(
    transcriptRef.current?.querySelectorAll(`[data-start="${start}"]`) || []
  )[0] as HTMLElement;
  const endElement = Array.from(
    transcriptRef.current?.querySelectorAll(`[data-end="${end}"]`) || []
  )[0] as HTMLElement;

  // If either start or end element is not found, return null.
  if (!startElement || !endElement) return null;

  const range = document.createRange();
  range.setStart(startElement, 0);

  // Check if endElement is a text node and set the range accordingly.
  if (endElement.nodeType === Node.TEXT_NODE) {
    range.setEnd(endElement, endElement.textContent?.length ?? 0);
  } else {
    range.setEnd(endElement, endElement.childNodes.length);
  }

  // Calculate the bounding rectangle for the selected range.
  const boundingRectangle = range.getBoundingClientRect();

  // Calculate the right edge position.
  const rightEdge =
    (transcriptRef.current?.getBoundingClientRect().right || 0) + 16;

  // Return the top and left positions for the note.
  return {
    top: boundingRectangle.top + window.scrollY,
    left: rightEdge,
  };
};
