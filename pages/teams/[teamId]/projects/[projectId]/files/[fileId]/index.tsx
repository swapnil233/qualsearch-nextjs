import SummaryCard from "@/components/card/summary/SummaryCard";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import Transcript from "@/components/transcript/Transcript";
import {
  getTeamIdFromProjectId,
  validateUserIsTeamMember,
} from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { NotesAndUsers } from "@/types";
import { getSignedUrl } from "@/utils/aws";
import { formatDatesToIsoString } from "@/utils/formatPrismaDates";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { Box } from "@mantine/core";
import {
  File,
  Transcript as PrismaTranscript,
  Summary,
  User,
} from "@prisma/client";
import { IconEdit, IconTrash, IconWand } from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

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
      let file = await prisma.file.findUniqueOrThrow({
        where: {
          id: fileId as string,
        },
      });
      file = formatDatesToIsoString(file);

      let transcript = await prisma.transcript.findUniqueOrThrow({
        where: {
          fileId: fileId as string,
        },
      });
      transcript = formatDatesToIsoString(transcript);

      let notes = await prisma.note.findMany({
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
        },
      });
      notes = formatDatesToIsoString(notes);

      // Get the team ID of the project
      const teamId = await getTeamIdFromProjectId(file.projectId);

      if (!teamId) {
        return {
          notFound: true,
        };
      }

      // Check if the user is in the team
      await validateUserIsTeamMember(teamId, user.id);

      // GET /api/aws/getSignedUrl?key={URI} endpoint to get the signed URL for the file
      const mediaUrl = await getSignedUrl(file.uri);

      if (mediaUrl) {
        return {
          props: {
            user,
            file,
            notes,
            transcript,
            mediaUrl,
            teamId,
            fileId,
            projectId,
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
  notes: NotesAndUsers[];
  transcript: PrismaTranscript;
  teamId: string;
  mediaUrl: string;
  user: User;
  fileId: string;
  projectId: string;
}

const FilePage: NextPageWithLayout<IFilePage> = ({
  file,
  notes,
  transcript,
  mediaUrl,
  user,
  teamId,
  fileId,
  projectId,
}) => {
  const mediaRef = useRef(null);
  const words = transcript.words;
  const [summary, setSummary] = useState<Summary | null>(null);

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
            ref={mediaRef}
            className="md:fixed md:bottom-2 md:left-2 md:w-1/5 z-50 w-full"
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

        <Box
          sx={{
            width: "75%",
          }}
        >
          <Transcript
            // @ts-ignore
            transcript={words}
            audioRef={mediaRef}
            user={user}
            existingNotes={notes}
            fileId={fileId}
            projectId={projectId}
          />
        </Box>
      </div>
    </>
  );
};

export default FilePage;
FilePage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
