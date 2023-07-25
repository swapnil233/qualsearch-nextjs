import { User } from "@prisma/client";
import Quill from "quill";
import React, { useEffect, useRef } from "react";

interface ITranscriptProps {
  transcript: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
  }[];
  user: User | null;
}

const Transcript: React.FC<ITranscriptProps> = ({ transcript, user }) => {
  const quillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (quillRef.current) {
      const quill = new Quill(quillRef.current);

      const editorContent = transcript
        .map((word) => {
          return `${word.punctuated_word} `;
        })
        .join("");

      quill.clipboard.dangerouslyPasteHTML(editorContent);
    }
  }, [transcript]);

  return <div ref={quillRef}></div>;
};

export default Transcript;
