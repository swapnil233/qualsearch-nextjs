"use client";

import { Box, Button, Group, Textarea, useMantineTheme } from "@mantine/core";
import { User } from "@prisma/client";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import format from "date-fns/format";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Comment } from "./extensions/comment";

interface TranscriptItem {
  start: number;
  end: number;
  speaker: number;
  punctuated_word: string;
}

interface ITiptapProps {
  transcript: TranscriptItem[];
  user: User | null;
}

const dateTimeFormat = "dd.MM.yyyy HH:mm";

// This type is used to define the structure of the object
// to be stored for comments, in the state.
interface CommentInstance {
  uuid?: string;
  comments?: any[];
}

const Tiptap: React.FC<ITiptapProps> = ({ transcript, user }) => {
  const theme = useMantineTheme();

  // Helper function to create a new paragraph
  const newParagraph = useCallback(
    (content: any) => ({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    }),
    []
  );

  // Transform transcript into a format suitable for Tiptap
  const transformTranscriptToTipTap = useCallback(
    (transcript: TranscriptItem[]) => {
      // tipTapContent will store the transformed transcript data
      const tipTapContent = [];

      // currentSpeaker will store the ID of the current speaker. It's initially null.
      let currentSpeaker: number | null = null;

      // currentSentence will store the current sentence being constructed.
      let currentSentence = "";

      transcript.forEach((item, i) => {
        // If the current speaker is not null (i.e., a sentence is being constructed)...
        // ...and the speaker of the current item is not the current speaker (i.e., the speaker has changed)...
        if (currentSpeaker !== null && currentSpeaker !== item.speaker) {
          // ...then push the current sentence to the tipTapContent array as a new paragraph...
          tipTapContent.push(newParagraph(currentSentence));

          // ...and add an empty paragraph to represent the change of speaker.
          tipTapContent.push({ type: "paragraph" });

          // Start a new sentence with the current item's punctuated_word.
          currentSentence = item.punctuated_word;
        } else {
          // If the speaker hasn't changed, append the current item's punctuated_word to the current sentence.
          // Add a space before the word if it's not the first item in the transcript.
          currentSentence += (i > 0 ? " " : "") + item.punctuated_word;
        }
        // Update the current speaker to the speaker of the current item.
        currentSpeaker = item.speaker;
      });

      // If there's a sentence remaining after iterating through the transcript, add it to the tipTapContent array.
      if (currentSentence) {
        tipTapContent.push(newParagraph(currentSentence));
      }

      // Return the transformed transcript data in the format required by Tiptap.
      return {
        type: "doc",
        content: tipTapContent,
      };
    },
    [newParagraph]
  );

  const editorContent = useMemo(
    () => transformTranscriptToTipTap(transcript),
    [transformTranscriptToTipTap, transcript]
  );

  const editor = useEditor({
    extensions: [StarterKit, Comment],
    content: editorContent,
    onUpdate({ editor }) {
      findCommentsAndStoreValues();
      setCurrentComment(editor);
    },

    onSelectionUpdate({ editor }) {
      setCurrentComment(editor);
      setIsTextSelected(!!editor.state.selection.content().size);
    },

    editorProps: {
      attributes: {
        spellcheck: "false",
      },
    },
  });

  const [isCommentModeOn, setIsCommentModeOn] = useState(false);

  const [currentUserName, setCurrentUserName] = useState(user?.name);

  const [currentUserId, setCurrentUserId] = useState(user?.id);

  const [commentText, setCommentText] = useState("");

  const [showCommentMenu, setShowCommentMenu] = useState(false);

  const [isTextSelected, setIsTextSelected] = useState(false);

  const [showAddCommentSection, setShowAddCommentSection] = useState(true);

  const formatDate = (d: any) =>
    d ? format(new Date(d), dateTimeFormat) : null;

  const [activeCommentsInstance, setActiveCommentsInstance] =
    useState<CommentInstance>({});

  const [allComments, setAllComments] = useState<any[]>([]);

  // This function finds and stores all the comments in the document
  const findCommentsAndStoreValues = () => {
    // Select the ProseMirror element from the document
    const proseMirror = document.querySelector(".ProseMirror");

    // Query for all span elements with a data-comment attribute within the ProseMirror element
    const comments = proseMirror?.querySelectorAll("span[data-comment]");

    // Initialize an empty array to store comments
    const tempComments: any[] = [];

    // If no comments are found, set allComments state to an empty array and return
    if (!comments) {
      setAllComments([]);
      return;
    }

    // Loop over each comment node
    comments.forEach((node) => {
      // Get the data-comment attribute value of the node
      const nodeComments = node.getAttribute("data-comment");

      // Parse the attribute value as JSON, if it exists, otherwise set it to null
      const jsonComments = nodeComments ? JSON.parse(nodeComments) : null;

      // If jsonComments is not null, add it to the tempComments array
      if (jsonComments !== null) {
        tempComments.push({
          node,
          jsonComments,
        });
      }
    });

    // Update the allComments state with the comments found
    setAllComments(tempComments);
  };

  const setCurrentComment = (editor: any) => {
    const newVal = editor.isActive("comment");
    console.log("newVal: ", newVal);

    if (newVal) {
      setTimeout(() => setShowCommentMenu(newVal), 50);

      setShowAddCommentSection(!editor.state.selection.empty);

      const parsedComment = JSON.parse(editor.getAttributes("comment").comment);
      console.log("parsedComment: ", parsedComment);

      parsedComment.comment =
        typeof parsedComment.comments === "string"
          ? JSON.parse(parsedComment.comments)
          : parsedComment.comments;

      setActiveCommentsInstance(parsedComment);
    } else {
      setActiveCommentsInstance({});
    }
  };

  const setComment = () => {
    if (!commentText.trim().length) return;

    const activeCommentInstance: CommentInstance = JSON.parse(
      JSON.stringify(activeCommentsInstance)
    );

    console.log("activeCommentInstance: ", activeCommentInstance);

    const commentsArray =
      typeof activeCommentInstance.comments === "string"
        ? JSON.parse(activeCommentInstance.comments)
        : activeCommentInstance.comments;

    if (commentsArray) {
      commentsArray.push({
        userId: currentUserId,
        userName: currentUserName,
        time: Date.now(),
        content: commentText,
      });

      const commentWithUuid = JSON.stringify({
        uuid: activeCommentsInstance.uuid || uuidv4(),
        comments: commentsArray,
      });

      // eslint-disable-next-line no-unused-expressions
      editor?.chain().setComment(commentWithUuid).run();
    } else {
      const commentWithUuid = JSON.stringify({
        uuid: uuidv4(),
        comments: [
          {
            userName: currentUserName,
            userId: currentUserId,
            time: Date.now(),
            content: commentText,
          },
        ],
      });

      // eslint-disable-next-line no-unused-expressions
      editor?.chain().setComment(commentWithUuid).run();
    }

    setTimeout(() => setCommentText(""), 50);
  };

  // const toggleCommentMode = () => {
  //   setIsCommentModeOn(!isCommentModeOn);

  //   if (isCommentModeOn) editor?.setEditable(false);
  //   else editor?.setEditable(true);
  // };

  useEffect((): any => setTimeout(findCommentsAndStoreValues, 100), []);

  // return <EditorContent editor={editor} />;

  return (
    <main className="flex flex-row tiptap">
      <section className="tiptap-container w-2/3">
        {/* <section className="buttons-section">
          <button
            onClick={() => toggleCommentMode()}
            type="button"
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg"
          >
            {isCommentModeOn ? "Comment mode ON" : "Comment mode OFF"}
          </button>

          <button
            onClick={() => log(editor?.getHTML())}
            type="button"
            className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg"
          >
            HTML to Console
          </button>
        </section> */}

        {editor && (
          <BubbleMenu
            tippy-options={{ duration: 100, placement: "bottom" }}
            editor={editor}
            className="bubble-menu"
            // shouldShow={() =>
            //   isCommentModeOn && isTextSelected && !activeCommentsInstance.uuid
            // }
          >
            <Box w={300} bg={theme.white}>
              <Textarea
                value={commentText}
                onInput={(e) => setCommentText((e.target as any).value)}
                minRows={4}
                placeholder="Add comment..."
              />
              <Group position="apart">
                <Button variant="default" onClick={() => setCommentText("")}>
                  Clear
                </Button>
                <Button onClick={() => setComment()}>Add</Button>
              </Group>
            </Box>
          </BubbleMenu>
        )}

        <EditorContent className="editor-content" editor={editor} />
      </section>

      <section className="flex flex-col">
        {allComments.map((comment, i) => {
          return (
            <article
              className={`comment external-comment shadow-lg my-2 bg-gray-100 transition-all rounded-md overflow-hidden ${
                comment.jsonComments.uuid === activeCommentsInstance.uuid
                  ? "ml-4"
                  : "ml-8"
              }`}
              key={i + "external_comment"}
            >
              {comment.jsonComments.comments.map(
                (jsonComment: any, j: number) => {
                  return (
                    <article
                      key={`${j}_${Math.random()}`}
                      className="external-comment border-b-2 border-gray-200 p-3"
                    >
                      <div className="comment-details">
                        <strong>{jsonComment.userName}</strong>

                        <span className="ml-1 date-time text-xs">
                          {formatDate(jsonComment.time)}
                        </span>
                      </div>

                      <span className="content">{jsonComment.content}</span>
                    </article>
                  );
                }
              )}

              {comment.jsonComments.uuid === activeCommentsInstance.uuid && (
                <section className="flex flex-col w-full gap-1">
                  <textarea
                    value={commentText}
                    onInput={(e) => setCommentText((e.target as any).value)}
                    onKeyPress={(e) => {
                      if (e.keyCode === 13) {
                        e.preventDefault();
                        e.stopPropagation();
                        setComment();
                      }
                    }}
                    cols={30}
                    rows={4}
                    placeholder="Add comment..."
                    className="border-none outline-none"
                  />

                  <section className="flex flex-row w-full gap-1">
                    <button
                      className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-lg shadow-lg w-1/3"
                      onClick={() => setCommentText("")}
                    >
                      Clear
                    </button>

                    <button
                      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-lg shadow-lg w-2/3"
                      onClick={() => setComment()}
                    >
                      Add (<kbd className="">Ent</kbd>)
                    </button>
                  </section>
                </section>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default Tiptap;
