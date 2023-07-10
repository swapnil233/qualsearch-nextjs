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
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconInfoHexagon,
  IconSend,
  IconSitemap,
} from "@tabler/icons-react";
import { FC, useState } from "react";

export interface ICreateFileModalWithSteppers {
  opened: boolean;
  close: () => void;
  creating: boolean;
  buttonText: string;
  form: ReturnType<
    typeof useForm<{
      fileName: string;
      fileDescription: string;
      file: File | null;
    }>
  >;

  handleCreateNewFile: (
    _values: {
      fileName: string;
      fileDescription: string;
      file: File | null;
    },
    _event: React.FormEvent
  ) => void;
}

const CreateFileModalWithSteppers: FC<ICreateFileModalWithSteppers> = ({
  opened,
  buttonText,
  close,
  creating,
  form,
  handleCreateNewFile,
}) => {
  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<Title order={3}>Add new file</Title>}
      centered
      padding={"lg"}
      size={"lg"}
    >
      <form onSubmit={form.onSubmit(handleCreateNewFile)}>
        <Stepper
          size="md"
          active={active}
          onStepClick={setActive}
          breakpoint="sm"
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
              mb={"sm"}
              size="md"
            />

            <TextInput
              placeholder="John Doe's User Interview"
              label="File name"
              description="The file's name will appear in the project report"
              radius="xs"
              withAsterisk
              mb={"sm"}
              size="md"
              {...form.getInputProps("fileName")}
            />

            <Textarea
              placeholder="This interview was conducted on..."
              label="Description"
              description="The file's description will appear in the project report"
              radius="xs"
              size="md"
              autosize
              minRows={2}
              mb={"sm"}
              {...form.getInputProps("fileDescription")}
            />
          </Stepper.Step>
          <Stepper.Step
            label="Step 2"
            description="File options"
            icon={<IconSitemap size="1.1rem" />}
          >
            <Radio.Group
              name="multipleSpeakers"
              label="Multiple speakers?"
              withAsterisk
              mb={"md"}
            >
              <Group mt="xs">
                <Radio value="true" label="Yes" />
                <Radio value="false" label="No" />
              </Group>
            </Radio.Group>

            <Radio.Group
              name="audioType"
              label="Audio type"
              description="Select the type of audio in this file (even if it is a video file)"
              withAsterisk
              mb={"md"}
            >
              <Group mt="xs">
                <Stack spacing={"sm"}>
                  <Radio
                    value="general"
                    label="General - for everyday conversation"
                  />
                  <Radio
                    value="phone_call"
                    label="Phone call - low bandwith audio from phone calls"
                  />
                  <Radio
                    value="conference_room"
                    label="Conference room - multiple speakers using a single mic"
                  />
                </Stack>
              </Group>
            </Radio.Group>

            <Checkbox.Group
              label="Redactions (optional)"
              description="We will try to redact sensitive information, replacing redacted content with asterisks (*)"
            >
              <Stack mt={"xs"} spacing={"sm"}>
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
            icon={<IconSend size="1.1rem" />}
            label="Step 3"
            description="Privacy notice"
          >
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Privacy Assurance Notice"
              color="green"
            >
              By submitting this file, you grant us permission to securely store
              it. Please rest assured that your file will remain confidential
              and inaccessible to external parties.
            </Alert>
          </Stepper.Step>
          <Stepper.Completed>dffd</Stepper.Completed>
        </Stepper>

        <Group position="apart" mt={"xl"}>
          <Group spacing={"xs"}>
            {active !== 0 && (
              <Button
                radius="xs"
                variant="default"
                onClick={prevStep}
                leftIcon={<IconArrowLeft size={"1.2rem"} />}
                type="button"
              >
                Back
              </Button>
            )}
            <Button
              radius="xs"
              onClick={close}
              variant={active === 0 ? "default" : "subtle"}
              type="button"
            >
              Cancel
            </Button>
          </Group>
          {active !== 2 ? (
            <Button
              radius="xs"
              rightIcon={<IconArrowRight size={"1.2rem"} />}
              onClick={nextStep}
            >
              Next step
            </Button>
          ) : (
            <Button
              radius="xs"
              leftIcon={<IconCheck size={"1.2rem"} />}
              onClick={nextStep}
              type="submit"
            >
              Submit
            </Button>
          )}
        </Group>
      </form>
    </Modal>
  );
};

export default CreateFileModalWithSteppers;
