import { TagDetails } from "@/components/card/tag/TagDetails";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import EmptyState from "@/components/states/empty/EmptyState";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { requireAuthentication } from "@/lib/auth/requireAuthentication";
import { exportToExcel } from "@/lib/export/exportToExcel";
import { formatDatesToIsoString } from "@/lib/formatDatesToIsoString";
import { host } from "@/lib/host";
import prisma from "@/lib/prisma";
import { NextPageWithLayout } from "@/pages/page";
import { TagWithNotesAndURIs } from "@/types";
import { Group, Switch, Title } from "@mantine/core";
import { IconDownload, IconEdit, IconTrash } from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

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
  const { teamId, projectId } = router.query;
  const [showQuote, setShowQuote] = useState<boolean>(true);

  const exportData = tagWithNotes.notes.map((note, index) => ({
    ID: index + 1,
    Note: note.text,
    Quote: note.transcriptText,
    Created: note.createdAt,
    "Created by": note.createdBy.name,
    "File link": `${host}/teams/${teamId}/projects/${projectId}/files/${note.fileId}/?noteId=${note.id}`,
  }));

  return (
    <>
      <Head>
        <title>{`Tag - ${tagWithNotes.name} | QualSearch`}</title>
        <meta
          name="viewport"
          content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        ></meta>
        <meta
          name="description"
          content={`All notes with the tag "${tagWithNotes.name}"`}
        />

        <meta
          property="og:title"
          content={`Tag ${tagWithNotes.name} | QualSearch`}
        />
        <meta
          property="og:description"
          content={`All notes with the tag "${tagWithNotes.name}"`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="QualSearch" />
      </Head>

      <PageHeading
        title={`Tag: ${tagWithNotes.name}`}
        primaryButtonText="Export"
        primaryButtonIcon={<IconDownload size={"1.2rem"} />}
        primaryButtonAction={() =>
          exportToExcel({ data: exportData, filename: "export.xlsx" })
        }
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
            title: "Files",
            href: `/teams/${teamId}/projects/${projectId}`,
          },
        ]}
      />

      {tagWithNotes.notes.length !== 0 ? (
        <>
          <Group align="center" mb={"md"}>
            <Title order={3} fw={"normal"}>
              {`${tagWithNotes.notes.length} ${
                tagWithNotes.notes.length > 1 ? "notes" : "note"
              } using this tag`}
            </Title>
            <Switch
              label="Show quotes"
              checked={showQuote}
              size="md"
              onChange={(event) => setShowQuote(event.currentTarget.checked)}
            />
          </Group>
          <TagDetails
            tagWithNotes={tagWithNotes}
            teamId={teamId as string}
            projectId={projectId as string}
            showQuote={showQuote}
          />
        </>
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
