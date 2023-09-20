import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import EmptyState from "@/components/states/empty/EmptyState";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { TagWithNotesAndURIs } from "@/types";
import { getSignedUrl } from "@/utils/aws";
import { formatDatesToIsoString } from "@/utils/formatPrismaDates";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  rem,
  useMantineTheme,
} from "@mantine/core";
import {
  IconEdit,
  IconExternalLink,
  IconPin,
  IconTrash,
  IconWand,
} from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { tagId, teamId } = context.query;

    // Check if the user is in the team
    await validateUserIsTeamMember(teamId as string, session.user.id);

    let tagWithNotes: TagWithNotesAndURIs = await prisma.tag.findUniqueOrThrow({
      where: {
        id: tagId as string,
      },
      include: {
        notes: {
          include: {
            file: {
              select: {
                uri: true,
                type: true,
              },
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    tagWithNotes = formatDatesToIsoString(tagWithNotes);

    return {
      props: {
        tagWithNotes,
      },
    };
  });
}

interface ITagPage {
  tagWithNotes: TagWithNotesAndURIs;
}

const TagPage: NextPageWithLayout<ITagPage> = ({ tagWithNotes }) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { teamId, projectId } = router.query;

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

  const handleConsolidateTags = async () => {};
  return (
    <>
      <Head>
        <title>{`Tag - ${tagWithNotes.name} | Transcription`}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta
          name="description"
          content={`All notes with the tag "${tagWithNotes.name}"`}
        />

        <meta
          property="og:title"
          content={`Tag ${tagWithNotes.name} | Transcription`}
        />
        <meta
          property="og:description"
          content={`All notes with the tag "${tagWithNotes.name}"`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Transcription" />
      </Head>

      <PageHeading
        title={`Tag: ${tagWithNotes.name}`}
        primaryButtonText="Consolidate"
        primaryButtonIcon={<IconWand size={"1.2rem"} />}
        primaryButtonAction={handleConsolidateTags}
        secondaryButtonMenuItems={[
          {
            title: "Edit file",
            action: () => console.log("Edit"),
            icon: <IconEdit size={14} />,
          },
          {
            title: "Delete file",
            action: () => console.log("Delete"),
            icon: <IconTrash size={14} />,
          },
        ]}
        breadcrumbs={[
          {
            title: "Home",
            href: "/",
          },
          {
            title: "Teams",
            href: "/teams",
          },
          {
            title: "Projects",
            href: `/teams/${teamId}`,
          },
          {
            title: "Tags",
            href: `/teams/${teamId}/projects/${projectId}/tags}`,
          },
        ]}
      />

      {tagWithNotes.notes.length !== 0 ? (
        <Stack w={"100%"}>
          <Title order={3} fw={"normal"}>
            {`${tagWithNotes.notes.length} ${
              tagWithNotes.notes.length > 1 ? "notes" : "note"
            } using this tag`}
          </Title>
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
                <Stack
                  justify="space-between"
                  p={"md"}
                  h={"100%"}
                  align="stretch"
                >
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
                        <Text fz="lg" fw={500}>
                          {note.text}
                        </Text>
                        <Text
                          color="dimmed"
                          mt={"md"}
                          pl={rem(8)}
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
                      </Box>
                      <Link
                        href={`/teams/${teamId}/people/${note.createdByUserId}`}
                        style={{
                          textDecoration: "none",
                        }}
                      >
                        <Group>
                          <Avatar
                            src={note.createdBy.image}
                            alt={note.createdBy.name || ""}
                            radius="xl"
                          />
                          <Stack spacing={0}>
                            <Text
                              fz="md"
                              truncate
                              color={
                                theme.colorScheme === "dark"
                                  ? "white"
                                  : theme.colors.dark[9]
                              }
                            >
                              {note.createdBy.name}
                            </Text>
                            <Text fz="xs" c="dimmed">
                              {new Date(note.createdAt).toDateString()}
                            </Text>
                          </Stack>
                        </Group>
                      </Link>
                    </Stack>
                  </Stack>
                  <Group>
                    <Button
                      radius="md"
                      style={{ flex: 1 }}
                      leftIcon={<IconExternalLink size={"1rem"} />}
                    >
                      Show details
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
      ) : (
        <EmptyState
          title="This tag hasn't been used yet..."
          description="To use this tag, open a file page, select some transcript text, and add this tag to the note."
          imageUrl="/empty-state-images/tags/empty-tags.svg"
        />
      )}
    </>
  );
};

export default TagPage;
TagPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
