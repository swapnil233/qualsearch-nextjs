import { TagDetails } from "@/components/card/tag/TagDetails";
import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import EmptyState from "@/components/states/empty/EmptyState";
import { validateUserIsTeamMember } from "@/infrastructure/services/team.service";
import { NextPageWithLayout } from "@/pages/page";
import { TagWithNotesAndURIs } from "@/types";
import { formatDatesToIsoString } from "@/utils/formatPrismaDates";
import prisma from "@/utils/prisma";
import { requireAuthentication } from "@/utils/requireAuthentication";
import { Group, Switch, Title } from "@mantine/core";
import { IconBrandFigma, IconEdit, IconTrash } from "@tabler/icons-react";
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
        primaryButtonText="Export to FigJam"
        primaryButtonIcon={<IconBrandFigma size={"1.2rem"} />}
        primaryButtonAction={() => console.log("Delete")}
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
