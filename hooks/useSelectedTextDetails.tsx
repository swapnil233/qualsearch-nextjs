import { useRef } from "react";

/**
 * Get details of the currently selected text on the screen.
 * The function extracts the start and end times from the data attributes of the selected elements.
 * It also calculates the position of the selected text based on the bounding rectangle of the selection.
 * @returns { { start: number, end: number, position: { top: number, left: number } } | null }
 */
function useSelectedTextDetails() {
  const transcriptRef = useRef<HTMLDivElement>(null);

  return function getSelectedTextDetails(): {
    start: number;
    end: number;
    position: { top: number; left: number };
  } | null {
    const selection = window.getSelection();

    // Check if there's a valid text selection
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const startElement = range.startContainer.parentElement as HTMLElement;
    const endElement = range.endContainer.parentElement as HTMLElement;

    if (!startElement?.dataset.start || !endElement?.dataset.end) {
      return null;
    }

    const start = parseFloat(startElement.dataset.start);
    const end = parseFloat(endElement.dataset.end);
    const boundingRectangle = range.getBoundingClientRect();
    const rightEdge =
      (transcriptRef.current?.getBoundingClientRect().right || 0) + 16;

    return {
      start,
      end,
      position: {
        top: boundingRectangle.top + window.scrollY,
        left: rightEdge,
      },
    };
  };
}

export default useSelectedTextDetails;
