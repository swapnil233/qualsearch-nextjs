import { FileWithoutTranscriptAndUri } from "@/types";
import timeAgo from "@/utils/timeAgo";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  MantineColor,
  Stack,
  Text,
} from "@mantine/core";
import { FileType } from "@prisma/client";
import {
  IconFileText,
  IconFileUnknown,
  IconHeadphones,
  IconPdf,
  IconPhoto,
  IconPresentation,
  IconVideo,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { FC, memo, useMemo } from "react";

export interface IFileCard {
  file: FileWithoutTranscriptAndUri;
  teamId: string;
}

interface IBadgeWithIcon {
  fileType: string;
  icon: React.ReactNode;
  color?: MantineColor;
}

const BadgeWithIcon: FC<IBadgeWithIcon> = ({ fileType, icon, color }) => {
  return (
    <Badge
      pl={0}
      py={"0.5rem"}
      size="sm"
      color={color}
      radius="md"
      leftSection={
        <Avatar variant="" color={color}>
          {icon}
        </Avatar>
      }
    >
      <Text>{fileType}</Text>
    </Badge>
  );
};

const TypeToIcon = (ft: FileType) => {
  switch (ft) {
    case "AUDIO":
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Audio"
          icon={<IconHeadphones size={"1rem"} />}
        />
      );
    case "VIDEO":
      return (
        <BadgeWithIcon
          color="green"
          fileType="Video"
          icon={<IconVideo size={"1rem"} />}
        />
      );
    case "EXCEL":
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Excel"
          icon={<IconFileText size={"1rem"} />}
        />
      );
    case "PDF":
      return (
        <BadgeWithIcon
          color="blue"
          fileType="PDF"
          icon={<IconPdf size={"1.2rem"} />}
        />
      );
    case "POWERPOINT":
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Powerpoint"
          icon={<IconPresentation size={"1.2rem"} />}
        />
      );
    case "WORD":
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Word"
          icon={<IconFileText size={"1.2rem"} />}
        />
      );
    case "IMAGE":
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Image"
          icon={<IconPhoto size={"1.2rem"} />}
        />
      );
    case "OTHER":
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Other"
          icon={<IconFileUnknown size={"1.2rem"} />}
        />
      );
    default:
      return null;
  }
};

const FileCard: FC<IFileCard> = ({ file, teamId }) => {
  const router = useRouter();
  const uploadedTimeAgo = useMemo(
    () => timeAgo(new Date(file.updatedAt)),
    [file.updatedAt]
  );

  return (
    <Card
      withBorder
      radius="sm"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
      })}
    >
      <Stack justify="space-between" align="stretch" h="100%">
        <Stack spacing={"xs"} justify="space-between" align="stretch">
          <Group w="100%" align="center" position="apart" noWrap>
            <Group spacing={"xs"}>
              {file.status === "PROCESSING" && <Loader size={"xs"} />}
              <Text fz="lg" fw={500}>
                {file.name}
              </Text>
            </Group>
            {TypeToIcon(file.type)}
          </Group>
          <Text fz="sm" c={"dimmed"} lineClamp={2}>
            {file.description}
          </Text>
        </Stack>

        <Group position="apart">
          <Text fz="sm" c={"dimmed"}>
            Updated {uploadedTimeAgo}
          </Text>
          <Button
            disabled={file.status === "PROCESSING"}
            // loading={file.status === "PROCESSING"}
            variant="default"
            onClick={() => {
              file.status === "COMPLETED"
                ? router.push(
                    `/teams/${teamId}/projects/${file.projectId}/files/${file.id}`
                  )
                : "";
            }}
          >
            {file.status === "PROCESSING" ? "Transcribing" : "View"}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default memo(FileCard);
