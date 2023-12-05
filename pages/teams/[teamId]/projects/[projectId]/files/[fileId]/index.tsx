import { TranscriptPageAside } from "@/components/aside/TranscriptPageAside";
import SummaryCard from "@/components/card/summary/SummaryCard";
import StatsGrid from "@/components/grids/StatsGrid";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import Transcript from "@/components/transcript/Transcript";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import { TagsProvider } from "@/contexts/TagsContext";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { getUserById } from "@/infrastructure/services/user.service";
import { NextPageWithLayout } from "@/pages/page";
import {
  NoteWithTagsAndCreator,
  Stat,
  TagWithNoteIds,
  TranscriptWord,
} from "@/types";
import { getSignedUrl } from "@/utils/aws";
import { formatDatesToIsoString } from "@/utils/formatDatesToIsoString";
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
import {
  IconBuilding,
  IconCalendar,
  IconEdit,
  IconHourglass,
  IconMessage,
  IconTag,
  IconTrash,
  IconUser,
  IconWand,
} from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return requireAuthentication(context, async (session: any) => {
    const { fileId, projectId } = context.query;
    const user = await getUserById(session.user.id);

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
        tags: TagWithNoteIds[],
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
            file: {
              select: {
                participantName: true,
                participantOrganization: true,
                dateConducted: true,
              },
            },
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
  initialTags: TagWithNoteIds[];
  transcript: PrismaTranscript;
  mediaUrl: string;
  user: User;
}

const FilePageContent: NextPageWithLayout<IFilePage> = ({
  file,
  transcript,
  mediaUrl,
  user,
}) => {
  const router = useRouter();
  const { noteId: rawNoteId } = router.query;

  const theme = useMantineTheme();

  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryHasLoaded, setSummaryHasLoaded] = useState<Boolean>(false);

  // Tabs of the aside component
  const [segment, setSegment] = useState<"tags" | "notes" | "ai">("notes");

  const words = transcript.words as TranscriptWord[];
  const transcriptContainerDivRef = useRef<HTMLDivElement>(null);

  const largeScreen = useMediaQuery("(min-width: 60em)");

  const noteId = (
    Array.isArray(rawNoteId) ? rawNoteId[0] : rawNoteId
  ) as string;

  // Notes context
  const { notes } = useNotes();

  // Unique tags - used for stats grid
  const [tagsCount, setTagsCount] = useState<number>(0);

  // Calculate unique tags
  useEffect(() => {
    const uniqueTags = new Set(
      notes.flatMap((note) => note.tags.map((tag) => tag.id))
    );
    setTagsCount(uniqueTags.size);
  }, [notes]);

  const statsGridIconStyles = {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
    size: "1.4rem",
    stroke: 1.5,
  };

  const stats: Stat[] = [
    {
      title: "Duration",
      value:
        mediaRef.current && mediaRef.current.duration
          ? `${Math.floor(mediaRef.current.duration / 60)} minutes`
          : "Error",
      icon: <IconHourglass {...statsGridIconStyles} />,
    },
    {
      title: "Notes",
      value: notes.length,
      icon: <IconMessage {...statsGridIconStyles} />,
    },
    {
      title: "Tags used",
      value: tagsCount,
      icon: <IconTag {...statsGridIconStyles} />,
    },
  ];

  const userInterviewStats: Stat[] = [
    {
      title: "Participant",
      value: file.participantName || "Not set",
      icon: <IconUser {...statsGridIconStyles} />,
    },
    {
      title: "Organization",
      value: file.participantOrganization || "Not set",
      icon: <IconBuilding {...statsGridIconStyles} />,
    },
    {
      title: "Date conducted",
      value: new Date(file.dateConducted!).toLocaleDateString() || "Not set",
      icon: <IconCalendar {...statsGridIconStyles} />,
    },
  ];

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

  return (
    <>
      <Head>
        <title>{`${file.name} | QualSearch`}</title>
        <meta
          name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta
          name="description"
          content={`File description: ${file.description}`}
        />

        <meta property="og:title" content={`${file.name} | QualSearch`} />
        <meta
          property="og:description"
          content={`File description: ${file.description}`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="QualSearch" />
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
            href: `/teams/${file.teamId}`,
          },
          {
            title: "Files",
            href: `/teams/${file.teamId}/projects/${file.projectId}`,
          },
        ]}
      />

      <div>
        {file.type === "VIDEO" ? (
          <video
            src={mediaUrl}
            controls
            ref={mediaRef as React.MutableRefObject<HTMLVideoElement>}
            className="w-full md:w-1/6 md:fixed bottom-[16px] z-50 right-[316px]"
          />
        ) : (
          <audio
            src={mediaUrl}
            controls
            ref={mediaRef}
            className="sticky top-4 w-full z-50"
          />
        )}

        <StatsGrid columns={3} stats={userInterviewStats} />
        <StatsGrid columns={3} stats={stats} />

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

        <Group>
          <Box
            sx={{
              marginTop: "1rem",
              width: useMediaQuery("(min-width: 60em)") ? "70%" : "90%",
              borderRight: `1px solid ${
                theme.colorScheme === "light"
                  ? theme.colors.gray[1]
                  : theme.colors.dark[6]
              }`,
              paddingRight: "0.5rem",
            }}
          >
            <Transcript
              words={words}
              mediaRef={mediaRef}
              user={user}
              scrollToNoteId={noteId}
              summaryHasLoaded={summaryHasLoaded}
              transcriptContainerDivRef={transcriptContainerDivRef}
            />
          </Box>

          {largeScreen && (
            <TranscriptPageAside
              segment={segment}
              setSegment={setSegment}
              mediaRef={mediaRef}
              transcriptContainerDivRef={transcriptContainerDivRef}
              user={user}
              fileId={file.id}
              transcriptId={transcript.id}
            />
          )}
        </Group>
      </div>
    </>
  );
};

const FilePage: NextPageWithLayout<IFilePage> = (props) => {
  return (
    <NotesProvider initialNotes={props.initialNotes}>
      <TagsProvider initialTags={props.initialTags}>
        <FilePageContent {...props} />
      </TagsProvider>
    </NotesProvider>
  );
};

export default FilePage;

FilePage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
