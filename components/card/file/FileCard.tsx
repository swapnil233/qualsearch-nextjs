import OptionsMenu from "@/components/menu/OptionsMenu";
import { FileWithoutTranscriptAndUri } from "@/types";
import { Card, Group, Stack, Text, useMantineColorScheme } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { FC, memo, useMemo } from "react";
import FileMetadata from "./FileMetadata";
import FileTitle from "./FileTitle";

export interface IFileCard {
  file: FileWithoutTranscriptAndUri;
}

const FileCard: FC<IFileCard> = ({ file }) => {
  const { colorScheme } = useMantineColorScheme();
  const { hovered, ref } = useHover();
  const { name, description, status } = file;

  const menuOptions = useMemo(
    () => [
      {
        option: "Edit",
        icon: <IconEdit size={"1rem"} />,
        onClick: () => {},
      },
      {
        option: "Delete",
        color: "red",
        icon: <IconTrash size={"1rem"} />,
        onClick: () => {},
      },
    ],
    []
  );

  return (
    <Card
      ref={ref}
      withBorder
      {...(hovered && { shadow: "xs" })}
      radius="sm"
      style={(theme) => ({
        backgroundColor:
          colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
        transition: "all 0.1s ease",
      })}
    >
      <Stack justify="space-between" align="stretch" h="100%" gap={"xl"}>
        <Stack gap={"xs"} justify="space-between" align="stretch">
          <Group wrap="nowrap" justify="space-between">
            <FileTitle title={name} status={status} />
            <OptionsMenu options={menuOptions} />
          </Group>
          <Text fz="sm" c={"dimmed"} lineClamp={2}>
            {description}
          </Text>
        </Stack>
        <FileMetadata file={file} />
      </Stack>
    </Card>
  );
};

export default memo(FileCard);
