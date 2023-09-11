import { NoteWithTagsAndCreator } from "@/types";
import { calculateNoteCardPosition } from "@/utils/calculateNoteCardPosition";
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconListSearch,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";

interface IAsideNotes {
  notes: NoteWithTagsAndCreator[];
  mediaRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  transcriptContainerDivRef: React.RefObject<HTMLDivElement>;
}

export const AsideNotes: React.FC<IAsideNotes> = ({
  notes,
  mediaRef,
  transcriptContainerDivRef,
}) => {
  const handlePlayClicked = (note: NoteWithTagsAndCreator) => {
    const notePosition = calculateNoteCardPosition(
      note.start,
      note.end,
      transcriptContainerDivRef
    );

    // Scroll to note
    window.scrollTo({
      top: notePosition ? notePosition.top - 100 : 0,
      behavior: "smooth",
    });

    if (mediaRef.current) {
      mediaRef.current.currentTime = note.start;
      mediaRef.current.play();

      // Stop playing when the note's end time is reached
      const stopAtNoteEnd = () => {
        if (mediaRef.current && mediaRef.current.currentTime >= note.end) {
          mediaRef.current.pause();
          mediaRef.current.removeEventListener("timeupdate", stopAtNoteEnd);
        }
      };

      mediaRef.current.addEventListener("timeupdate", stopAtNoteEnd);
    }
  };

  const handleFindClicked = (note: NoteWithTagsAndCreator) => {
    const notePosition = calculateNoteCardPosition(
      note.start,
      note.end,
      transcriptContainerDivRef
    );

    // Scroll to note
    window.scrollTo({
      top: notePosition ? notePosition.top - 100 : 0,
      behavior: "smooth",
    });
  };

  return (
    <Stack h={"100%"} spacing={"lg"}>
      {notes.map((note) => (
        <Card key={note.id} withBorder>
          <Stack align="flex-start" spacing={"xl"}>
            <Stack spacing={"sm"} w={"100%"}>
              <Stack justify="space-between" align="center" w={"100%"}>
                <Group position="apart" w={"100%"}>
                  <Group>
                    <Avatar
                      src={note.createdBy.image}
                      alt={note.createdBy.name || ""}
                      radius="xl"
                    />
                    <Stack spacing={0}>
                      <Text fz="md">{note.createdBy.name}</Text>
                      <Text fz="xs" c="dimmed">
                        {new Date(note.createdAt).toDateString()}
                      </Text>
                    </Stack>
                  </Group>

                  <Menu shadow="md" width={200}>
                    <Menu.Target>
                      <ActionIcon variant="transparent">
                        <IconDots size="1rem" />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item icon={<IconEdit size={14} />}>Edit</Menu.Item>
                      <Menu.Item color="red" icon={<IconTrash size={14} />}>
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Stack>
              <Stack>
                <Text fz={"sm"}>{note.text}</Text>
                <Group grow>
                  <Button
                    compact
                    variant="default"
                    leftIcon={<IconPlayerPlay size={"1rem"} />}
                    onClick={() => handlePlayClicked(note)}
                  >
                    Play
                  </Button>
                  <Button
                    compact
                    variant="default"
                    leftIcon={<IconListSearch size={"1rem"} />}
                    onClick={() => handleFindClicked(note)}
                  >
                    Find
                  </Button>
                </Group>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
};
