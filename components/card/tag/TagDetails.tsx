import { TagWithNotesAndURIs } from "@/types";
import { getSignedUrl } from "@/utils/aws";
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
        cols={6}
        spacing={"md"}
        verticalSpacing={"md"}
        breakpoints={[
          { maxWidth: "120rem", cols: 3, spacing: "md" },
          { maxWidth: "90rem", cols: 2, spacing: "md" },
          { maxWidth: "48rem", cols: 1, spacing: "sm" },
        ]}
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
                        italic
                        sx={{
                          borderLeft: `3px solid ${
                            theme.colorScheme === "light"
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
                  leftIcon={<IconShare size={"1rem"} />}
                >
                  Share clip
                </Button>
                <Button
                  radius="md"
                  variant="light"
                  style={{ flex: 1 }}
                  leftIcon={<IconExternalLink size={"1rem"} />}
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
