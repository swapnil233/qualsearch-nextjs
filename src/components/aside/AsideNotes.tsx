import { calculateNoteCardPosition } from "@/lib/calculateNoteCardPosition";
import HighlightSearch from "@/lib/highlightSearchTerm";
import { NoteWithTagsAndCreator } from "@/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  SimpleGrid,
  Spoiler,
  Stack,
  Text,
  Tooltip,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconListSearch,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";

interface IAsideNotes {
  search: string;
  notes: NoteWithTagsAndCreator[];
  mediaRef: React.MutableRefObject<HTMLAudioElement | HTMLVideoElement | null>;
  transcriptContainerDivRef: React.RefObject<HTMLDivElement>;
}

export const AsideNotes: React.FC<IAsideNotes> = ({
  notes,
  search,
  mediaRef,
  transcriptContainerDivRef,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const router = useRouter();
  const { teamId, projectId } = router.query;

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
    <Stack gap={"lg"}>
      {notes.map((note) => (
        <Card key={note.id} withBorder>
          <Stack gap={"sm"} w={"100%"}>
            <Stack justify="space-between" align="center" w={"100%"}>
              <Group align="apart" w={"100%"}>
                <Link
                  href={`/teams/${teamId}/people/${note.createdByUserId}`}
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <Group>
                    <Avatar
                      src={note.createdBy?.image || "anonUser.png"}
                      alt={note.createdBy?.name || "Anonymous User"}
                      radius="xl"
                    />
                    <Stack gap={0}>
                      <Text
                        fz="md"
                        truncate
                        color={
                          colorScheme === "dark"
                            ? "white"
                            : theme.colors.dark[9]
                        }
                      >
                        {note.createdBy?.name || "Anonymous User"}
                      </Text>
                      <Text fz="xs" c="dimmed">
                        {new Date(note.createdAt).toDateString()}
                      </Text>
                    </Stack>
                  </Group>
                </Link>

                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="transparent">
                      <IconDots size="1rem" />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item leftSection={<IconEdit size={14} />}>
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Stack>
            <Stack>
              <Stack gap={"md"}>
                <Stack gap={"xs"}>
                  <Spoiler
                    maxHeight={48}
                    showLabel="Show more"
                    hideLabel="Hide"
                    pl={rem(8)}
                    fz={"sm"}
                    style={{
                      fontStyle: "italic",
                      color: "gray",
                      borderLeft: `3px solid ${
                        colorScheme === "light"
                          ? theme.colors.gray[3]
                          : theme.colors.dark[4]
                      }`,
                    }}
                  >
                    <HighlightSearch
                      text={note.transcriptText.trim()}
                      search={search}
                    />
                  </Spoiler>
                  <Text fw={500} fz={"sm"}>
                    <HighlightSearch text={note.text.trim()} search={search} />
                  </Text>
                </Stack>
                <SimpleGrid
                  w={"100%"}
                  cols={2}
                  spacing={"xs"}
                  verticalSpacing={"xs"}
                >
                  {note.tags.map((tag) => {
                    return (
                      <Link
                        key={tag.id}
                        href={`/teams/${teamId}/projects/${projectId}/tags/${tag.id}`}
                        style={{
                          textDecoration: "none",
                        }}
                      >
                        <Tooltip label={tag.name}>
                          <Badge
                            fullWidth
                            radius="xs"
                            // variant="filled"
                            size="sm"
                            color="blue"
                          >
                            {tag.name}
                          </Badge>
                        </Tooltip>
                      </Link>
                    );
                  })}
                </SimpleGrid>
              </Stack>
              <Group grow>
                <Button
                  size="compact-md"
                  variant="default"
                  leftSection={<IconPlayerPlay size={"1rem"} />}
                  onClick={() => handlePlayClicked(note)}
                >
                  Play
                </Button>
                <Button
                  size="compact-md"
                  variant="default"
                  leftSection={<IconListSearch size={"1rem"} />}
                  onClick={() => handleFindClicked(note)}
                >
                  Find
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
};
