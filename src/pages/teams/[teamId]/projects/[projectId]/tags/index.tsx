import PageHeading from "@/components/layout/heading/PageHeading";
import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { NextPageWithLayout } from "@/pages/page";
import { GetServerSidePropsContext } from "next";
import router from "next/router";

// Page /teams/[teamId]/projects/[projectId]/tags/index.tsx
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {},
  };
}

interface ITagsPage {}

const TagsPage: NextPageWithLayout<ITagsPage> = () => {
  const { teamId } = router.query;
  return (
    <>
      <SharedHead title={"Tags"} description={"Tags"} />

      <PageHeading
        title="Tags"
        description={"Tags description"}
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
            href: `/teams/${teamId}/projects`,
          },
        ]}
      />
    </>
  );
};

export default TagsPage;

TagsPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};