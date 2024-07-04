import { Group, Loader, Text } from "@mantine/core";
import { FileStatus } from "@prisma/client";

export interface IFileTitleProps {
  title: string;
  status: FileStatus;
}

const FileTitle: React.FC<IFileTitleProps> = ({ title, status }) => {
  return (
    <Group gap={"xs"}>
      {status === "PROCESSING" && <Loader size={"xs"} />}
      <Text fz="lg" fw={500}>
        {title}
      </Text>
    </Group>
  );
};

export default FileTitle;
