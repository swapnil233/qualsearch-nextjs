"use client";

import { User } from "@prisma/client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface ITiptapProps {
  transcript: {
    start: number;
    end: number;
    speaker: number;
    punctuated_word: string;
  }[];
  user: User | null;
}

const Tiptap: React.FC<ITiptapProps> = ({ transcript, user }) => {
  // Helper function to create a new paragraph
  const newParagraph = (content: any) => ({
    type: "paragraph",
    content: [
      {
        type: "text",
        text: content,
      },
    ],
  });

  const transformTranscriptToTipTap = (transcript: any) => {
    const tipTapContent = [];
    let currentSpeaker: any = null;
    let currentSentence = "";

    transcript.forEach((item: any, i: number) => {
      if (currentSpeaker !== null && currentSpeaker !== item.speaker) {
        // If speaker has changed, add the current sentence to TipTap content,
        // followed by 1 empty line (paragraphs)
        tipTapContent.push(newParagraph(currentSentence));
        tipTapContent.push({ type: "paragraph" });
        // Start a new sentence with the new speaker
        currentSentence = item.punctuated_word;
      } else {
        // If it's the same speaker, or the first speaker, append the word to the sentence
        currentSentence += (i > 0 ? " " : "") + item.punctuated_word;
      }

      currentSpeaker = item.speaker;
    });

    // After the loop, add the final sentence (if there is one) to the TipTap content
    if (currentSentence) {
      tipTapContent.push(newParagraph(currentSentence));
    }

    return {
      type: "doc",
      content: tipTapContent,
    };
  };

  const editorContent = transformTranscriptToTipTap(transcript);

  const editor = useEditor({
    extensions: [StarterKit],
    content: editorContent,
  });

  return <EditorContent editor={editor} />;
};

export default Tiptap;
