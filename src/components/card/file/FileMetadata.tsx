import { FileWithoutTranscriptAndUri } from "@/types";
import { Button, Group, Text } from "@mantine/core";
import { IconBuilding, IconCalendar, IconUser } from "@tabler/icons-react";
import Link from "next/link";

interface IFileMetadataProps {
  file: FileWithoutTranscriptAndUri;
}

const FileMetadata: React.FC<IFileMetadataProps> = ({ file }) => {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Group>
        {file.participantName && (
          <Group gap={4} wrap="nowrap">
            <IconUser size={"1.1rem"} color="gray" />
            <Text fz="sm" c={"dimmed"} truncate lineClamp={1} maw={"100%"}>
              {file.participantName.trim()}
            </Text>
          </Group>
        )}

        {file.participantOrganization && (
          <Group gap={4} wrap="nowrap">
            <IconBuilding size={"1.1rem"} color="gray" />
            <Text fz="sm" c={"dimmed"} truncate lineClamp={1} maw={"100%"}>
              {file.participantOrganization.trim()}
            </Text>
          </Group>
        )}

        {file.dateConducted && (
          <Group gap={4} wrap="nowrap">
            <IconCalendar size={"1.1rem"} color="gray" />
            <Text fz="sm" c={"dimmed"} truncate lineClamp={1} maw={"100%"}>
              {new Date(file.dateConducted).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
            </Text>
          </Group>
        )}
      </Group>
      <Button
        disabled={file.status === "PROCESSING"}
        variant="default"
        component={Link}
        href={
          file.status === "COMPLETED"
            ? `/teams/${file.teamId}/projects/${file.projectId}/files/${file.id}`
            : ""
        }
      >
        {file.status === "PROCESSING" ? "Transcribing" : "View"}
      </Button>
    </Group>
  );
};

export default FileMetadata;
