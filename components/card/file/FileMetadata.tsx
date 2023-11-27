import { FileWithoutTranscriptAndUri } from "@/types";
import { Button, Group, Text } from "@mantine/core";
import { IconBuilding, IconCalendar, IconUser } from "@tabler/icons-react";
import router from "next/router";

interface IFileMetadataProps {
  file: FileWithoutTranscriptAndUri;
}

const FileMetadata: React.FC<IFileMetadataProps> = ({ file }) => {
  return (
    <Group position="apart" noWrap>
      <Group>
        {file.participantName && (
          <Group spacing={4} noWrap>
            <IconUser size={"1.1rem"} color="gray" />
            <Text fz="sm" c={"dimmed"} truncate lineClamp={1} maw={"100%"}>
              {file.participantName.trim()}
            </Text>
          </Group>
        )}

        {file.participantOrganization && (
          <Group spacing={4} noWrap>
            <IconBuilding size={"1.1rem"} color="gray" />
            <Text fz="sm" c={"dimmed"} truncate lineClamp={1} maw={"100%"}>
              {file.participantOrganization.trim()}
            </Text>
          </Group>
        )}

        {file.dateConducted && (
          <Group spacing={4} noWrap>
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
        onClick={() => {
          file.status === "COMPLETED"
            ? router.push(
                `/teams/${file.teamId}/projects/${file.projectId}/files/${file.id}`
              )
            : "";
        }}
      >
        {file.status === "PROCESSING" ? "Transcribing" : "View"}
      </Button>
    </Group>
  );
};

export default FileMetadata;
