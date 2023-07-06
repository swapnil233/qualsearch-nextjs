import { FileWithoutTranscriptAndUri } from "@/types";
import { Avatar, Badge, Card, MantineColor, Stack, Text } from "@mantine/core";
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
import Link from "next/link";
import React, { FC } from "react";

export interface IFileCard {
  file: FileWithoutTranscriptAndUri;
  teamId: string;
}

interface IBadgeWithIcon {
  fileType: string;
  icon: React.ReactNode;
  color?: MantineColor;
}

const FileCard: FC<IFileCard> = ({ file, teamId }) => {
  // This is a component that renders a badge with an icon
  const BadgeWithIcon: FC<IBadgeWithIcon> = ({ fileType, icon, color }) => {
    return (
      <Badge
        pl={0}
        py={8}
        size="sm"
        color={color}
        radius="md"
        leftSection={
          <Avatar radius="sm" color={color}>
            {icon}
          </Avatar>
        }
      >
        {fileType}
      </Badge>
    );
  };

  // This is a component that renders an icon based on the file type
  const TypeToIcon = (ft: FileType) => {
    if (ft === "AUDIO") {
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Audio"
          icon={<IconHeadphones size={"1rem"} />}
        />
      );
    } else if (ft === "VIDEO") {
      return (
        <BadgeWithIcon
          color="green"
          fileType="Video"
          icon={<IconVideo size={"1rem"} />}
        />
      );
    } else if (ft === "EXCEL") {
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Excel"
          icon={<IconVideo size={"1rem"} />}
        />
      );
    } else if (ft === "PDF") {
      return (
        <BadgeWithIcon
          color="blue"
          fileType="PDF"
          icon={<IconPdf size={"1.2rem"} />}
        />
      );
    } else if (ft === "POWERPOINT") {
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Powerpoint"
          icon={<IconPresentation size={"1.2rem"} />}
        />
      );
    } else if (ft === "WORD") {
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Word"
          icon={<IconFileText size={"1.2rem"} />}
        />
      );
    } else if (ft === "IMAGE") {
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Image"
          icon={<IconPhoto size={"1.2rem"} />}
        />
      );
    } else if (ft === "OTHER") {
      return (
        <BadgeWithIcon
          color="blue"
          fileType="Other"
          icon={<IconFileUnknown size={"1.2rem"} />}
        />
      );
    }
  };

  return (
    <Card withBorder padding="md" radius="md">
      <Stack justify="space-between" h={"100%"}>
        <div>
          <Text fz="lg" fw={500} className="line-clamp-2">
            <Link
              href={`/teams/${teamId}/projects/${file.projectId}/files/${file.id}`}
            >
              {file.name}
            </Link>
          </Text>
          <Text fz="sm" c="dimmed" mt={5} lineClamp={2}>
            {file.description}
          </Text>
        </div>
        <div className="mt-4">
          <Text fz="sm" c="dimmed" mb={8}>
            Uploaded {file.createdAt.toLocaleString()}
          </Text>
          {TypeToIcon(file.type)}
        </div>
      </Stack>
    </Card>
  );
};

export default FileCard;
