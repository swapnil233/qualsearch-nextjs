import { useNotes } from "@/contexts/NotesContext";
import { useTags } from "@/contexts/TagsContext";
import {
  NoteWithTagsAndCreator,
  SelectedText,
  TagWithNoteIds,
  TranscriptWord,
} from "@/types";
import { notifications } from "@mantine/notifications";
import { User } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";

export const useNoteCreation = (
  selectedText: { start: number; end: number } | null,
  setSelectedText: React.Dispatch<React.SetStateAction<SelectedText | null>>,
  words: TranscriptWord[],
  user: User,
  setNoteIsCreating: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const router = useRouter();
  const { setNotes } = useNotes();
  const { tags, setTags } = useTags();
  const { fileId, projectId } = router.query;

  const handleNoteSubmission = async (
    note: string,
    selectedTags: string[],
    newTagNamesFromMultiSelect: string[]
  ) => {
    if (!selectedText) return;

    setNoteIsCreating(true);

    // Step 1: Optimistically update the UI with a temporary note
    const tempNoteId = new Date().getTime().toString();

    const optimisticNote: NoteWithTagsAndCreator = {
      id: tempNoteId,
      text: note,
      createdBy: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
      tags: selectedTags.map((selectedTag) => ({
        id: new Date().getTime().toString(),
        // 'tag' is either the ID of an existing tag, or the name of a new tag. For name, go through all the notes and find the tag within note.tags with that id and if it doesn't exist, just use 'tag' because it's a new tag
        name: tags.find((tag) => tag.id === selectedTag)?.name || selectedTag,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUserId: user.id,
        projectId: projectId as string,
      })),
      createdAt: new Date(),
      createdByUserId: user.id,
      start: selectedText!.start,
      end: selectedText!.end,
      fileId: fileId as string,
      projectId: projectId as string,
      file: {
        dateConducted: new Date(),
        participantName: "",
        participantOrganization: "",
      },
      // transcriptText is all the words between selectedText.start and selectedText.end
      transcriptText: words
        .filter(
          (word) =>
            word.start >= selectedText!.start && word.end <= selectedText!.end
        )
        .map((word) => word.punctuated_word)
        .join(" "),
      updatedAt: new Date(),
    };

    setNotes((prevNotes) => [...prevNotes, optimisticNote]);
    setSelectedText(null);
    setNoteIsCreating(false);

    // Step 2: Create the note in the database
    try {
      // Filter out any tags that match new tags created by the user frm the multi-select component
      const filteredTags = selectedTags.filter(
        (tag) => !newTagNamesFromMultiSelect.includes(tag)
      );

      // Check if any of the tags selected are new. If so, create it, and return an array of newly created tags
      const newTagsResponse = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newTagNames: newTagNamesFromMultiSelect,
          projectId: projectId,
          createdByUserId: user.id,
        }),
      });

      if (!newTagsResponse.ok) {
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "We couldn't create those tags",
          message:
            "Something went wrong on our end. Try again in a few minutes.",
          color: "red",
          icon: <IconX />,
          loading: false,
        });
        throw new Error(`Error: ${newTagsResponse.statusText}`);
      }

      // The response contains an array of the new tag IDs
      const newTags: TagWithNoteIds[] = await newTagsResponse.json();

      const tagIds = filteredTags.concat(newTags.map((tag) => tag.id));

      const noteData = {
        text: note,
        start: selectedText?.start,
        end: selectedText?.end,
        fileId: fileId,
        projectId: projectId,
        createdByUserId: user.id,
        tagIds: tagIds,
      };

      const newNoteResponse = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!newNoteResponse.ok) {
        notifications.show({
          withCloseButton: true,
          autoClose: 5000,
          title: "We couldn't create that note",
          message:
            "Something went wrong on our end. Try again in a few minutes.",
          color: "red",
          icon: <IconX />,
          loading: false,
        });
        throw new Error(`Error: ${newNoteResponse.statusText}`);
      }

      // Step 3: Handle Success - Replace the optimistic note with the actual note data
      const newNote: NoteWithTagsAndCreator = await newNoteResponse.json();

      setNotes((prevNotes) => [
        ...prevNotes.filter((note) => note.id !== tempNoteId), // Remove optimistic note
        newNote, // Add the new note from the server
      ]);
      setTags((prevTags) => [...prevTags, ...newTags]);
      // setNoteIsCreating(false);
      setSelectedText(null);

      await fetch(`${process.env.EXPRESS_BACKEND_URL}/api/embeddings/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId,
          noteId: newNote.id,
        }),
      });

      await fetch(
        `${process.env.EXPRESS_BACKEND_URL}/api/embeddings/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: projectId,
            noteId: newNote.id,
          }),
        }
      );
    } catch (error) {
      console.error(error);
      // Step 4: Handle Failure - Remove the optimistic note and show error
      setNotes((prevNotes) =>
        prevNotes.filter((note) => note.id !== tempNoteId)
      );

      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "We couldn't create that note",
        message: "Something went wrong on our end. Try again in a few minutes.",
        color: "red",
        icon: <IconX />,
        loading: false,
      });

      setNoteIsCreating(false);
    }
  };

  return { handleNoteSubmission };
};
