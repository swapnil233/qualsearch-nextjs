import {
  Alert,
  Button,
  Checkbox,
  FileInput,
  Group,
  Modal,
  Radio,
  Stack,
  Stepper,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconInfoHexagon,
  IconListCheck,
  IconSpy,
} from "@tabler/icons-react";
import { FC, useState } from "react";

export interface ICreateFileModal {
  opened: boolean;
  close: () => void;
  creating: boolean;
  buttonText: string;
  form: ReturnType<
    typeof useForm<{
      fileName: string;
      fileDescription: string;
      participantName: string;
      participantOrganization: string;
      dateConducted: Date;
      file: File | null;
      multipleSpeakers: boolean;
      audioType: string;
      redactions: string[];
      transcriptionQuality: "nova-2" | "whisper" | "whisper-large";
    }>
  >;

  handleCreateNewFile: (
    _values: {
      fileName: string;
      fileDescription: string;
      participantName: string;
      participantOrganization: string;
      dateConducted: Date;
      file: File | null;
      multipleSpeakers: boolean;
      audioType: string;
      redactions: string[];
      transcriptionQuality: "nova-2" | "whisper" | "whisper-large";
    },
    _event?: React.FormEvent<HTMLFormElement>
  ) => void;
}

const CreateFileModal: FC<ICreateFileModal> = ({
  opened,
  buttonText,
  close,
  creating,
  form,
  handleCreateNewFile,
}) => {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const goToNextStep = async () => {
    // if active step is the last one (3rd step, index 2), then handle form submission
    if (active === 2) {
      setLoading(true);
      const syntheticEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });

      // TS says the "await" is redundant, but removing it stops the step-by-step spinner from working
      await handleCreateNewFile(
        form.values,
        syntheticEvent as unknown as React.FormEvent<HTMLFormElement>
      );

      setLoading(false);
      setActive((current) => current + 1);
      setCompleted(true);
    } else {
      // otherwise, go to the next step
      setActive((current) => (current < 3 ? current + 1 : current));
    }
  };

  const { transcriptionQuality } = form.values;
  const disableAudioType =
    transcriptionQuality === "whisper" ||
    transcriptionQuality === "whisper-large";

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Create new file"
      centered
      padding={"lg"}
      size={"lg"}
    >
      <form
        onSubmit={form.onSubmit((values, event) =>
          handleCreateNewFile(values, event as React.FormEvent<HTMLFormElement>)
        )}
      >
        <Stepper
          size="sm"
          active={active}
          onStepClick={setActive}
          // breakpoint="sm"
        >
          <Stepper.Step
            icon={<IconInfoHexagon size="1.1rem" />}
            label="Step 1"
            description="Basic information"
          >
            <FileInput
              placeholder="Select a file..."
              label="File"
              accept="audio/*,video/*"
              description="Audio and video files are supported."
              value={form.values.file}
              onChange={(file) => form.setFieldValue("file", file)}
              required
              mb={"lg"}
            />

            <TextInput
              placeholder="John Doe's User Interview"
              label="File name"
              description="The file's name will appear in the project report"
              radius="xs"
              withAsterisk
              mb={"lg"}
              {...form.getInputProps("fileName")}
            />

            <TextInput
              placeholder="John Doe"
              label="Participant's name"
              description="If there are multiple participants, enter the name of the main participant. You can change this later."
              radius="xs"
              withAsterisk
              mb={"lg"}
              {...form.getInputProps("participantName")}
            />

            <TextInput
              placeholder="XYZ Energy Corp."
              label="Participant's Organization"
              description="This helps us generate more accurate insights. You can change this later."
              radius="xs"
              withAsterisk
              mb={"lg"}
              {...form.getInputProps("participantOrganization")}
            />

            <DateInput
              label="Date conducted"
              description="When was this user interview conducted?"
              radius="xs"
              withAsterisk
              mb={"lg"}
              {...form.getInputProps("dateConducted")}
            />

            <Textarea
              placeholder="This interview was conducted on..."
              label="Description"
              description="This will help our AI systems generate more accurate insights."
              radius="xs"
              autosize
              minRows={4}
              mb={"lg"}
              {...form.getInputProps("fileDescription")}
            />
          </Stepper.Step>

          <Stepper.Step
            label="Step 2"
            description="Transcription options"
            icon={<IconListCheck size="1.1rem" />}
          >
            <Radio.Group
              name="transcriptionQuality"
              label="Transcription quality"
              description="We will notify you when the transcription is finished."
              withAsterisk
              mb={"lg"}
              {...form.getInputProps("transcriptionQuality")}
            >
              <Group mt="xs">
                <Stack gap={"sm"}>
                  <Radio value="nova-2" label="Good (recommended)" />
                  <Radio value="whisper" label="Better" />
                  <Radio
                    value="whisper-large"
                    label="Best (takes significantly longer)"
                  />
                </Stack>
              </Group>
            </Radio.Group>

            <Radio.Group
              name="multipleSpeakers"
              label="Multiple speakers?"
              withAsterisk
              mb={"lg"}
              {...form.getInputProps("multipleSpeakers")}
            >
              <Group mt="xs">
                <Radio value="true" label="Yes" />
                <Radio value="false" label="No" />
              </Group>
            </Radio.Group>

            <Radio.Group
              name="audioType"
              label="Audio type"
              description="Select the type of audio in this file (even if it is a video file)."
              // withAsterisk
              mb={"lg"}
              {...form.getInputProps("audioType")}
            >
              <Group mt="xs">
                <Stack gap={"sm"}>
                  <Radio
                    disabled={disableAudioType}
                    value="general"
                    label="General (recommended) - for everyday conversation"
                  />
                  <Radio
                    disabled={disableAudioType}
                    value="phone_call"
                    label="Phone call - low bandwith audio from phone calls"
                  />
                  <Radio
                    disabled={disableAudioType}
                    value="conference_room"
                    label="Conference room - multiple speakers using a single mic"
                  />
                </Stack>
              </Group>
            </Radio.Group>

            <Checkbox.Group
              label="Redactions (optional)"
              description="We will try to redact sensitive information, replacing redacted content with asterisks (*)"
              {...form.getInputProps("redactions")}
              mb={"lg"}
            >
              <Stack mt={"xs"} gap={"sm"}>
                <Checkbox
                  label="PCI - sensative information, such as credit card numbers"
                  value="pci"
                />
                <Checkbox label="SSN - social security numbers" value="ssn" />
                <Checkbox label="Numbers" value="numbers" />
              </Stack>
            </Checkbox.Group>
          </Stepper.Step>

          <Stepper.Step
            icon={<IconSpy size="1.1rem" />}
            label="Step 3"
            description="Privacy notice"
            loading={loading}
          >
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Privacy assurance notice"
              color="green"
            >
              By submitting this file, you grant us permission to securely store
              and process it. Please rest assured that your file will remain
              confidential and inaccessible to external parties.
            </Alert>
          </Stepper.Step>

          {completed && (
            <Stepper.Completed>
              Your file has been uploaded and is now being processed. We will
              notify via email you when the transcription is completed. You can
              refresh the page in a few minutes, or leave the app.
            </Stepper.Completed>
          )}
        </Stepper>

        <Group justify="space-between" mt={"xl"}>
          <Group gap={"xs"}>
            {active !== 0 && (
              <Button
                radius="xs"
                variant="default"
                onClick={prevStep}
                leftSection={<IconArrowLeft size={"1.2rem"} />}
                type="button"
              >
                Back
              </Button>
            )}
            <Button
              radius="xs"
              onClick={() => {
                close();
                form.reset();
                setActive(0);
              }}
              variant={active === 0 ? "default" : "subtle"}
              type="button"
            >
              Cancel
            </Button>
          </Group>
          {active !== 2 ? (
            <Button
              radius="xs"
              rightSection={<IconArrowRight size={"1.2rem"} />}
              onClick={goToNextStep}
            >
              {active === 0
                ? "Transcription options"
                : "Privacy acknowledgement"}
            </Button>
          ) : (
            <Button
              radius="xs"
              leftSection={!creating && <IconCheck size={"1.2rem"} />}
              onClick={goToNextStep}
              loading={creating}
            >
              {buttonText}
            </Button>
          )}
        </Group>
      </form>
    </Modal>
  );
};

export default CreateFileModal;
