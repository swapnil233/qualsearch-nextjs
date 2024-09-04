import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { Button, Container, Group, Text, Title } from "@mantine/core";
import Link from "next/link";
import { NextPageWithLayout } from "./page";

const NotFound: NextPageWithLayout = () => {
  return (
    <>
      <SharedHead
        title="Error 500!"
        description="500! Internal server error."
      />
      <Container className="py-20">
        <div className="text-center font-extrabold text-[220px] leading-none mb-24 text-gray-200 dark:text-gray-700 sm:text-[120px]">
          500
        </div>
        <Title className="font-extrabold text-center text-[38px] sm:text-[32px]">
          Error 500: Internal Server Error
        </Title>
        <Text
          color="dimmed"
          size="lg"
          ta="center"
          className="max-w-[500px] mx-auto mt-6 mb-24"
        >
          Sorry, an error has occurred, and we are working to fix it. Please
          contact help@qualsearch.io if the problem persists. Thank you for your
          patience.
        </Text>
        <Group align="center">
          <Link href="/">
            <Button variant="default" size="md">
              Take me home
            </Button>
          </Link>
        </Group>
      </Container>
    </>
  );
};

export default NotFound;

NotFound.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
