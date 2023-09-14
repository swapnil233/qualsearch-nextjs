import { TranscriptPageAside } from "@/components/aside/TranscriptPageAside";
import SummaryCard from "@/components/card/summary/SummaryCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import { StatsGrid } from "@/components/stats/StatsGrid";
import Transcript from "@/components/transcript/Transcript";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { NoteWithTagsAndCreator, TagWithNotes } from "@/types";
import { getSignedUrl } from "@/utils/aws";
import { formatDatesToIsoString } from "@/utils/formatPrismaDates";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { Box, Group, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  File,
  Transcript as PrismaTranscript,
  Summary,
  User,
} from "@prisma/client";
import { IconEdit, IconTrash, IconWand } from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { fileId, projectId } = context.query;
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return {
        notFound: true,
      };
    }

    try {
      type BatchRequest = [
        file: File,
        transcript: PrismaTranscript,
        notes: NoteWithTagsAndCreator[],
        tags: TagWithNotes[]
      ];

      let [file, transcript, notes, tags]: BatchRequest = await Promise.all([
        prisma.file.findUniqueOrThrow({
          where: {
            id: fileId as string,
          },
        }),

        prisma.transcript.findUniqueOrThrow({
          where: {
            fileId: fileId as string,
          },
        }),

        // Get all the notes in this file
        prisma.note.findMany({
          where: {
            fileId: fileId as string,
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            tags: true,
          },
        }),

        // Get all the tags available in this project
        prisma.tag.findMany({
          where: {
            projectId: projectId as string,
          },
          include: {
            createdBy: {
              select: {
                id: true,
              },
            },
            notes: {
              select: {
                id: true,
              },
            },
          },
        }),
      ]);

      file = formatDatesToIsoString(file);
      transcript = formatDatesToIsoString(transcript);
      notes = formatDatesToIsoString(notes);
      tags = formatDatesToIsoString(tags);

      const teamId = file.teamId;

      // Check if the user is in the team
      await validateUserIsTeamMember(teamId, user.id);

      // GET /api/aws/getSignedUrl?key={URI} endpoint to get the signed URL for the file
      const mediaUrl = await getSignedUrl(file.uri);

      if (mediaUrl) {
        return {
          props: {
            user,
            file,
            initialNotes: notes,
            initialTags: tags,
            transcript,
            mediaUrl,
          },
        };
      } else {
        return {
          notFound: true,
        };
      }
    } catch (error) {
      return {
        notFound: true,
      };
    }
  });
}

interface IFilePage {
  file: File;
  initialNotes: NoteWithTagsAndCreator[];
  initialTags: TagWithNotes[];
  transcript: PrismaTranscript;
  mediaUrl: string;
  user: User;
}

const FilePage: NextPageWithLayout<IFilePage> = ({
  file,
  initialNotes,
  initialTags,
  transcript,
  mediaUrl,
  user,
}) => {
  const theme = useMantineTheme();
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const words = transcript.words;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryHasLoaded, setSummaryHasLoaded] = useState<Boolean>(false);

  const [tags, setTags] = useState<TagWithNotes[]>(initialTags);
  const [uniqueTagsCount, setUniqueTagsCount] = useState<number>(0);

  const [notes, setNotes] = useState<NoteWithTagsAndCreator[]>(initialNotes);

  const [segment, setSegment] = useState<"tags" | "notes" | "chat">("notes");

  const transcriptContainerDivRef = useRef<HTMLDivElement>(null);

  const largeScreen = useMediaQuery("(min-width: 60em)");

  const fileId = file.id;
  const projectId = file.projectId;
  const teamId = file.teamId;

  // Get the number of unique tags being used in this file
  useEffect(() => {
    setUniqueTagsCount(
      new Set(notes.flatMap((note) => note.tags.map((tag) => tag.id))).size
    );
  }, [tags, notes]);

  // Get the number of contributors in this file
  let contributorsCount: number = useMemo(() => {
    return new Set(notes.map((note) => note.createdByUserId)).size;
  }, [notes]);

  // Fetch summary if it exists, else create one.
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(
          `/api/summaries?transcriptId=${transcript.id}`
        );

        // Summary exists in DB
        if (response.status === 200) {
          const summaryData = await response.json();
          setSummary(summaryData);
          setSummaryHasLoaded(true);
        }

        // Create new summary since it doesn't exist in DB.
        else if (response.status === 404) {
          try {
            const response = await fetch("/api/summaries/", {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              method: "POST",
              body: JSON.stringify({ transcriptId: transcript.id }),
            });

            // Summary created successfully
            if (response.status === 200) {
              const newSummary = await response.json();
              setSummary(newSummary.summary);
              setSummaryHasLoaded(true);
            }
          } catch (error) {
            console.log(error);
          }
        } else {
          console.error("Response error:", response.status);
        }
      } catch (error) {
        console.log("Could not fetch summary:", error);
      }
    };

    fetchSummary();
  }, [transcript.id]);

  const editFile = () => {
    console.log("Edit file");
  };

  const handleDelete = () => {
    console.log("Delete file");
  };

  const handleSummarize = () => {
    console.log("summarize");
  };

  console.log("Tags", tags);

  return (
    <>
      <Head>
        <title>{`${file.name} | Transcription`}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta
          name="description"
          content={`File description: ${file.description}`}
        />

        <meta property="og:title" content={`${file.name} | Transcription`} />
        <meta
          property="og:description"
          content={`File description: ${file.description}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Transcription" />
      </Head>

      <PageHeading
        title={file.name}
        description={file.description || ""}
        primaryButtonText="Summarize"
        primaryButtonIcon={<IconWand size={"1.2rem"} />}
        primaryButtonAction={handleSummarize}
        secondaryButtonMenuItems={[
          {
            title: "Edit file",
            action: editFile,
            icon: <IconEdit size={14} />,
          },
          {
            title: "Delete file",
            action: handleDelete,
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
            title: "Files",
            href: `/teams/${teamId}/projects/${file.projectId}`,
          },
        ]}
      ></PageHeading>

      <div>
        {file.type === "VIDEO" ? (
          <video
            src={mediaUrl}
            controls
            ref={mediaRef as React.MutableRefObject<HTMLVideoElement>}
            className="lg:fixed lg:bottom-2 lg:left-2 lg:w-1/6 md:w-full z-50 w-full"
          />
        ) : (
          <audio
            src={mediaUrl}
            controls
            ref={mediaRef}
            className="sticky top-4 w-full z-50"
          />
        )}

        <Box mt={"lg"} id="summary-box">
          {summary ? (
            <SummaryCard
              summary={summary.content}
              dateSummarized={summary.createdAt}
            />
          ) : (
            <SummaryCard summary="" dateSummarized="" />
          )}
        </Box>

        <StatsGrid
          duration={
            mediaRef.current && mediaRef.current.duration
              ? `${Math.floor(mediaRef.current.duration / 60)} minutes`
              : "Error"
          }
          notesCount={notes.length}
          tagsCount={uniqueTagsCount}
          contributorsCount={contributorsCount}
        />

        <Group>
          <Box
            sx={{
              marginTop: "1rem",
              width: "70%",
              borderRight: `1px solid ${
                theme.colorScheme === "light"
                  ? theme.colors.gray[1]
                  : theme.colors.dark[6]
              }`,
              paddingRight: "0.5rem",
            }}
          >
            <Transcript
              // @ts-ignore - Type 'JsonValue' from Prisma is not assignable to type '{ start: number; end: number; speaker: number; punctuated_word: string; }[]'.
              transcript={words}
              audioRef={mediaRef}
              user={user}
              notes={notes}
              setNotes={setNotes}
              fileId={fileId}
              projectId={projectId}
              summaryHasLoaded={summaryHasLoaded}
              tags={tags}
              setTags={setTags}
              transcriptContainerDivRef={transcriptContainerDivRef}
            />
          </Box>

          {largeScreen && (
            <TranscriptPageAside
              notes={notes}
              tags={tags}
              setTags={setTags}
              segment={segment}
              setSegment={setSegment}
              mediaRef={mediaRef}
              transcriptContainerDivRef={transcriptContainerDivRef}
              user={user}
            />
          )}
        </Group>
      </div>
    </>
  );
};

export default FilePage;
FilePage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
