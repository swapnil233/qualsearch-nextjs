import PageHeading from "@/components/layout/heading/PageHeading";
import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import SharedHead from "@/components/shared/SharedHead";
import { NextPageWithLayout } from "@/pages/page";
import { GetServerSidePropsContext } from "next";
import router from "next/router";

// Page /teams/[teamId]/projects/[projectId]/dashboard/index.tsx
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {},
  };
}

interface IDashboardPage {}

const DashboardPage: NextPageWithLayout<IDashboardPage> = () => {
  const { teamId } = router.query;
  return (
    <>
      <SharedHead title={"Dashboard"} description={"Dashboard"} />

      <PageHeading
        title="Dashboard"
        description={"Dashboard description"}
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

export default DashboardPage;

DashboardPage.getLayout = (page) => {
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
