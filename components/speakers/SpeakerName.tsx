import { IGroup } from "@/utils/groupTranscriptBySpeaker";
import { Button, Popover, Text, TextInput } from "@mantine/core";
import { Dispatch, FC, SetStateAction } from "react";

interface ISpeakerName {
  group: IGroup;
  speakerNames: Record<number, string>;
  setSpeakerNames: Dispatch<SetStateAction<Record<number, string>>>;
  newSpeakerName: string;
  setNewSpeakerName: Dispatch<SetStateAction<string>>;
}

export const SpeakerName: FC<ISpeakerName> = ({
  group,
  speakerNames,
  setSpeakerNames,
  newSpeakerName,
  setNewSpeakerName,
}) => {
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

  return (
    <Popover
      width={300}
      trapFocus
      position="bottom-start"
      withArrow
      shadow="lg"
    >
      <Popover.Target>
        <Text
          color="#190041"
          fs={"1.2rem"}
          mt={"2rem"}
          mb={"8px"}
          fw={"bold"}
          w={"100%"}
          sx={{
            cursor: "pointer",
            ":hover": {
              textDecoration: "underline",
            },
          }}
        >
          {/* Either use the speaker name from the state or the speaker name from the transcript */}
          {speakerNames[group.speaker] || `Speaker ${group.speaker + 1}`}
        </Text>
      </Popover.Target>
      <Popover.Dropdown
        sx={(theme) => ({
          background:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
        })}
      >
        <TextInput
          label="Change speaker name"
          placeholder={
            speakerNames[group.speaker] || `Speaker ${group.speaker + 1}`
          }
          mb="md"
          value={newSpeakerName}
          onChange={(e) => {
            setNewSpeakerName(e.target.value);
            // Close the popover after setting the new speaker name
          }}
        />
        <Button
          size="xs"
          variant="light"
          onClick={() => {
            if (newSpeakerName !== "") {
              handleSpeakerNameChange(group.speaker, newSpeakerName);
            }
          }}
        >
          Change
        </Button>
      </Popover.Dropdown>
    </Popover>
  );
};
