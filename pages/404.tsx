import PrimaryLayout from "@/components/layout/primary/PrimaryLayout";
import SharedHead from "@/components/shared/SharedHead";
import { Button, Container, Group, Text, Title } from "@mantine/core";
import Link from "next/link";
import { NextPageWithLayout } from "./page";

const NotFound: NextPageWithLayout = () => {
  return (
    <>
      <SharedHead title="404" description="404! This page does not exist." />
      <Container className="py-20">
        <div className="text-center font-black text-[220px] leading-none mb-[6rem] text-gray-200 dark:text-gray-700 sm:text-[120px]">
          404
        </div>
        <Title className="font-black text-center text-[38px] sm:text-[32px]">
          Error 404: Lost in Cyberspace
        </Title>
        <Text
          color="dimmed"
          size="lg"
          ta="center"
          className="max-w-[500px] mx-auto mt-6 mb-[6rem]"
        >
          We&apos;re sorry, but the page you&apos;re seeking seems to be lost in
          cyberspace. We invite you to return to the homepage and continue your
          journey through our website.
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
  return <PrimaryLayout>{page}</PrimaryLayout>;
};
