import {
  ActionIcon,
  Container,
  Group,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

export interface IFooter {}

export const footerData = [
  {
    title: "About",
    links: [
      {
        label: "Features",
        link: "#",
      },
      {
        label: "Support",
        link: "#",
      },
    ],
  },
  {
    title: "Project",
    links: [
      {
        label: "Contribute",
        link: "https://github.com/swapnil233/next-transcription",
      },
      {
        label: "Media assets",
        link: "#",
      },
      {
        label: "Changelog",
        link: "#",
      },
      {
        label: "Releases",
        link: "#",
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        label: "Join Discord",
        link: "#",
      },
      {
        label: "Follow on Twitter",
        link: "#",
      },
      {
        label: "Email newsletter",
        link: "#",
      },
      {
        label: "GitHub discussions",
        link: "#",
      },
    ],
  },
];

const Footer: FC<IFooter> = () => {
  const { colorScheme } = useMantineColorScheme();

  const groups = footerData.map((group) => {
    const links = group.links.map((link, index) => (
      <Text<"a">
        key={index}
        className="block text-gray-600 hover:underline dark:text-gray-400"
        component="a"
        href={link.link}
        onClick={(event) => event.preventDefault()}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className="w-40" key={group.title}>
        <Text className="text-lg font-bold mb-2.5 text-black dark:text-white">
          {group.title}
        </Text>
        {links}
      </div>
    );
  });

  return (
    <footer className="mt-30 pt-14 pb-14 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
      <div className="max-w-6xl mx-auto px-6 sm:px-4">
        <Container className="flex justify-between flex-wrap sm:flex-nowrap">
          <div className="flex flex-col sm:items-center">
            <Link href="/">
              <Image
                src={
                  colorScheme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"
                }
                height={30}
                width={109}
                alt="Logo"
              />
            </Link>
            <Text
              size="xs"
              color="dimmed"
              className="mt-1 text-center text-gray-500 dark:text-gray-400"
            >
              Transcription, summarization and diarization with AI
            </Text>
          </div>
          <div className="flex flex-wrap">{groups}</div>
        </Container>
        <Container className="flex justify-between items-center mt-6 pt-6 pb-6 border-t border-gray-200 dark:border-gray-600">
          <Text
            color="dimmed"
            size="sm"
            className="text-gray-500 dark:text-gray-400"
          >
            © 2023 Transcribe. All rights reserved.
          </Text>
          <Group gap={0} className="flex space-x-2 mt-1 sm:mt-0">
            <ActionIcon size="lg">
              <IconBrandTwitter size="1.05rem" stroke={1.5} />
            </ActionIcon>
            <ActionIcon size="lg">
              <IconBrandYoutube size="1.05rem" stroke={1.5} />
            </ActionIcon>
            <ActionIcon size="lg">
              <IconBrandInstagram size="1.05rem" stroke={1.5} />
            </ActionIcon>
          </Group>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
