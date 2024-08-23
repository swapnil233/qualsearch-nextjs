import { getSignedUrl } from "@/lib/aws/aws";
import { TagWithNotesAndURIs } from "@/types";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  rem,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconExternalLink, IconPin, IconShare } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";

interface ITagDetails {
  tagWithNotes: TagWithNotesAndURIs;
  teamId: string;
  projectId: string;
  showQuote: boolean;
}

export const TagDetails: FC<ITagDetails> = ({
  tagWithNotes,
  projectId,
  teamId,
  showQuote,
}) => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [presignedUrls, setPresignedUrls] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    async function fetchPresignedUrls() {
      const urls: { [key: string]: string } = {};
      for (const note of tagWithNotes.notes) {
        const signedUrl = await getSignedUrl(note.file.uri);
        if (signedUrl) {
          urls[note.id] = signedUrl;
        }
      }
      setPresignedUrls(urls);
    }

    fetchPresignedUrls();
  }, [tagWithNotes]);
  return (
    <Stack w={"100%"}>
      <SimpleGrid
        verticalSpacing={"md"}
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing={{ base: "sm", sm: "md" }}
      >
        {tagWithNotes.notes.map((note) => (
          <Card key={note.id} withBorder radius="sm" p={0}>
            <Stack justify="space-between" p={"md"} h={"100%"} align="stretch">
              <Stack h={"100%"} justify="space-between" align="stretch">
                <Box>
                  {note.file.type === "VIDEO" ? (
                    <video
                      controls
                      preload="none"
                      src={presignedUrls[note.id]}
                      style={{ width: "100%", maxHeight: "180px" }}
                      onLoadedMetadata={(e) => {
                        const videoElement = e.target as HTMLVideoElement;
                        videoElement.currentTime = note.start;
                      }}
                      onTimeUpdate={(e) => {
                        const videoElement = e.target as HTMLVideoElement;
                        if (videoElement.currentTime >= note.end) {
                          videoElement.pause();
                        }
                      }}
                    />
                  ) : (
                    <audio
                      className="rounded-none w-full"
                      controls
                      preload="none"
                      src={presignedUrls[note.id]}
                      onLoadedMetadata={(e) => {
                        const audioElement = e.target as HTMLAudioElement;
                        audioElement.currentTime = note.start;
                      }}
                      onTimeUpdate={(e) => {
                        const audioElement = e.target as HTMLAudioElement;
                        if (audioElement.currentTime >= note.end) {
                          audioElement.pause();
                        }
                      }}
                    />
                  )}
                </Box>
                <Stack
                  h={"100%"}
                  justify="space-between"
                  align="stretch"
                  className="fff"
                >
                  <Box>
                    <Text fz="lg" fw={500} lh={1.4}>
                      {note.text}
                    </Text>
                    {showQuote && (
                      <Text
                        color="dimmed"
                        mt={"md"}
                        pl={rem(8)}
                        fs="italic"
                        style={{
                          borderLeft: `3px solid ${
                            colorScheme === "light"
                              ? theme.colors.gray[3]
                              : theme.colors.dark[4]
                          }`,
                        }}
                      >
                        {`"${note.transcriptText.trim()}"`}
                      </Text>
                    )}
                  </Box>
                </Stack>
              </Stack>
              <Group>
                <Button
                  radius="md"
                  style={{ flex: 1 }}
                  leftSection={<IconShare size={"1rem"} />}
                >
                  Share clip
                </Button>
                <Button
                  radius="md"
                  variant="light"
                  style={{ flex: 1 }}
                  leftSection={<IconExternalLink size={"1rem"} />}
                  component="a"
                  href={`/teams/${teamId}/projects/${projectId}/files/${note.fileId}?noteId=${note.id}`}
                  target="_blank"
                >
                  Source
                </Button>
                <ActionIcon variant="default" radius="md" size={36}>
                  <IconPin stroke={1.5} />
                </ActionIcon>
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
};
