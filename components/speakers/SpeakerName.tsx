import {
  Avatar,
  Box,
  Button,
  Group,
  Popover,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { Dispatch, FC, SetStateAction, useMemo } from "react";

interface ISpeakerName {
  speaker: number;
  speakerNames: Record<number, string>;
  setSpeakerNames: Dispatch<SetStateAction<Record<number, string>>>;
  newSpeakerName: string;
  setNewSpeakerName: Dispatch<SetStateAction<string>>;
  transcriptId: string;
}

export const SpeakerName: FC<ISpeakerName> = ({
  speaker,
  speakerNames,
  setSpeakerNames,
  newSpeakerName,
  setNewSpeakerName,
  transcriptId,
}) => {
  const { colorScheme } = useMantineColorScheme();

  const handleSpeakerNameChange = async (speaker: number, name: string) => {
    try {
      const response = await fetch(
        `/api/transcripts/${transcriptId}/speakers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcriptId: transcriptId,
            speakerIndex: speaker,
            name,
          }),
        }
      );

      if (response.ok) {
        setSpeakerNames((prev) => ({
          ...prev,
          [speaker]: name,
        }));
        setNewSpeakerName("");
      } else {
        // Handle error
        console.error("Failed to update speaker name");
      }
    } catch (error) {
      console.error("Error updating speaker name:", error);
    }
  };

  const firstTwoLettersOfName = useMemo(() => {
    return speakerNames[speaker]
      ?.split(" ")
      .map((word) => word[0])
      .join("");
  }, [speakerNames, speaker]);

  return (
    <Box>
      <Popover width={300} trapFocus position="bottom" withArrow shadow="lg">
        <Popover.Target>
          <Group gap={"xs"}>
            <Avatar variant="filled" color="blue.9" radius="xl" size={"sm"}>
              {firstTwoLettersOfName}
            </Avatar>
            <Text
              c={colorScheme === "dark" ? "#eeeeee" : "#190041"}
              fs={"1.2rem"}
              fw={"bold"}
              style={{
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
