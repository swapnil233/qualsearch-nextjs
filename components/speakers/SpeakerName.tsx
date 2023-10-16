import {
  Avatar,
  Box,
  Button,
  Group,
  Popover,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { Dispatch, FC, SetStateAction, useMemo } from "react";

interface ISpeakerName {
  speaker: number;
  speakerNames: Record<number, string>;
  setSpeakerNames: Dispatch<SetStateAction<Record<number, string>>>;
  newSpeakerName: string;
  setNewSpeakerName: Dispatch<SetStateAction<string>>;
}

export const SpeakerName: FC<ISpeakerName> = ({
  speaker,
  speakerNames,
  setSpeakerNames,
  newSpeakerName,
  setNewSpeakerName,
}) => {
  const theme = useMantineTheme();
  /**
   * Handle the change of the speaker name by updating the state and clearing the input
   * @param speaker
   * @param name
   */
  const handleSpeakerNameChange = (speaker: number, name: string) => {
    setSpeakerNames((prev) => ({
      ...prev,
      [speaker]: name,
    }));

    setNewSpeakerName("");
  };

  const firstTwoLettersOfName = useMemo(() => {
    return speakerNames[speaker]
      ?.split(" ")
      .map((word) => word[0])
      .join("");
  }, [speakerNames, speaker]);

  return (
    <Box>
      <Popover
        width={300}
        trapFocus
        position="bottom-start"
        withArrow
        shadow="lg"
      >
        <Popover.Target>
          <Group spacing={"xs"}>
            <Avatar variant="filled" color="blue.9" radius="xl" size={"sm"}>
              {firstTwoLettersOfName}
            </Avatar>
            <Text
              color={theme.colorScheme === "dark" ? "#eeeeee" : "#190041"}
              fs={"1.2rem"}
              fw={"bold"}
              sx={{
                cursor: "pointer",
                ":hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {/* Either use the speaker name from the state or the speaker name from the transcript */}
              {speakerNames[speaker] || `Speaker ${speaker + 1}`}
            </Text>
          </Group>
        </Popover.Target>
        <Popover.Dropdown>
          <TextInput
            label="Change speaker name"
            placeholder={speakerNames[speaker] || `Speaker ${speaker + 1}`}
            mb="md"
            value={newSpeakerName}
            onChange={(e) => {
              setNewSpeakerName(e.target.value);
              // Close the popover after setting the new speaker name
              close();
            }}
          />
          <Button
            size="xs"
            variant="default"
            onClick={() => {
              if (newSpeakerName !== "") {
                handleSpeakerNameChange(speaker, newSpeakerName);
              }
            }}
          >
            Change
          </Button>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
};
