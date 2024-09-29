import { TranscriptPageAside } from "@/components/aside/TranscriptPageAside";
import SummaryCard from "@/components/card/summary/SummaryCard";
import StatsGrid from "@/components/grids/StatsGrid";
import PageHeading from "@/components/layout/heading/PageHeading";
import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import Transcript from "@/components/transcript/Transcript";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import { TagsProvider } from "@/contexts/TagsContext";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { getUser } from "@/infrastructure/services/user.service";
import { auth } from "@/lib/auth/auth";
import { getSignedUrl } from "@/lib/aws/aws";
import prisma from "@/lib/prisma";
import { NextPageWithLayout } from "@/pages/page";
import {
  NoteWithTagsAndCreator,
  Stat,
  TagWithNoteIds,
  TranscriptWord,
} from "@/types";
import {
  Box,
  Group,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
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
  IconX,
} from "@tabler/icons-react";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context.req, context.res);
  if (!session) {
    return {
      redirect: {
        destination: `/signin`,
        permanent: false,
      },
    };
  }

  const user = await getUser({ id: session.user.id });

  if (!user) {
    return {
      notFound: true,
    };
  }

  try {
    const { fileId, projectId } = context.query;

    type BatchRequest = [
      file: File,
      transcript: PrismaTranscript,
      notes: NoteWithTagsAndCreator[],
      tags: TagWithNoteIds[],
    ];

    const [file, transcript, notes, tags]: BatchRequest = await Promise.all([
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

    const teamId = file.teamId;

    // Check if the user is in the team
    await validateUserIsTeamMember(teamId, user.id);

    // GET /api/aws/getSignedUrl?key={URI} endpoint to get the signed URL for the file
    const mediaUrl = await getSignedUrl(file.uri);

    if (mediaUrl) {
      return {
        props: {
          user: JSON.parse(JSON.stringify(user)),
          file: JSON.parse(JSON.stringify(file)),
          initialNotes: JSON.parse(JSON.stringify(notes)),
          initialTags: JSON.parse(JSON.stringify(tags)),
          transcript: JSON.parse(JSON.stringify(transcript)),
          mediaUrl,
        },
      };
    } else {
      console.error("Could not get signed URL for file");
      return {
        notFound: true,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      notFound: true,
    };
  }
}

interface IFilePage {
  file: File;
  initialNotes: NoteWithTagsAndCreator[];
  initialTags: TagWithNoteIds[];
  transcript: PrismaTranscript;
  mediaUrl: string;
  user: User;
}

const FilePageContent: NextPageWithLayout<
  IFilePage & {
    mediaRef: React.MutableRefObject<
      HTMLAudioElement | HTMLVideoElement | null
    >;
    transcriptContainerDivRef: React.RefObject<HTMLDivElement>;
  }
> = ({
  file,
  transcript,
  mediaUrl,
  user,
  mediaRef,
  transcriptContainerDivRef,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const router = useRouter();
  const { noteId: rawNoteId } = router.query;

  const theme = useMantineTheme();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryHasLoaded, setSummaryHasLoaded] = useState<Boolean>(false);

  const words = transcript.words as TranscriptWord[];

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
    color: colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[4],
    size: "1.4rem",
    stroke: 1.5,
  };

  const stats: Stat[] = [
    {
      title: "Duration",
      value:
        mediaRef.current && mediaRef.current.duration
          ? `${Math.floor(mediaRef.current.duration / 60)} minutes`
          : "Loading...",
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
      value: new Date(file.dateConducted!).toDateString() || "Not set",
      icon: <IconCalendar {...statsGridIconStyles} />,
    },
  ];

  // Fetch summary if it exists, else create one.
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/summaries?transcriptId=${transcript.id}`
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
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_EXPRESS_BACKEND_URL}/api/summaries/`,
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ transcriptId: transcript.id }),
              }
            );

            // Summary created successfully
            if (response.status === 200) {
              const newSummary = await response.json();
              setSummary(newSummary.summary);
              setSummaryHasLoaded(true);
            }
          } catch (error) {
            // Summary creation failed
            notifications.show({
              withCloseButton: true,
              autoClose: 5000,
              title: "We couldn't create a summary for this transcript",
              message: "Try again later.",
              color: "red",
              icon: <IconX />,
              loading: false,
            });
            setSummaryHasLoaded(true);
            setSummary({
              id: "",
              content:
                "We couldn't create a summary for this transcript. Please try again later.",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
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
      <SharedHead title={file.name} description={file.description || ""} />
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
            href: `/teams/${file.teamId}/projects/${file.projectId}/files`,
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

        <StatsGrid stats={userInterviewStats} />
        <StatsGrid stats={stats} />

        <Box mt={"lg"} id="summary-box">
          {summary ? (
            <SummaryCard
              summary={summary.content || ""}
              dateSummarized={summary.createdAt}
            />
          ) : (
            <SummaryCard summary="" dateSummarized="" />
          )}
        </Box>

        <Group>
          <Box
            style={{
              marginTop: "1rem",
              width: useMediaQuery("(min-width: 60em)") ? "70%" : "90%",
              borderRight: `1px solid ${
                colorScheme === "light"
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
              transcriptId={transcript.id}
            />
          </Box>
        </Group>
      </div>
    </>
  );
};

const FilePage: NextPage<IFilePage> = (props) => {
  const [segment, setSegment] = useState<"tags" | "notes" | "ai">("notes");
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const transcriptContainerDivRef = useRef<HTMLDivElement>(null);

  return (
    <NotesProvider initialNotes={props.initialNotes}>
      <TagsProvider initialTags={props.initialTags}>
        <DashboardLayout
          aside={
            <TranscriptPageAside
              segment={segment}
              setSegment={setSegment}
              mediaRef={mediaRef}
              transcriptContainerDivRef={transcriptContainerDivRef}
              user={props.user}
              fileId={props.file.id}
              transcriptId={props.transcript.id}
            />
          }
        >
          <FilePageContent
            {...props}
            mediaRef={mediaRef}
            transcriptContainerDivRef={transcriptContainerDivRef}
          />
        </DashboardLayout>
      </TagsProvider>
    </NotesProvider>
  );
};

export default FilePage;
