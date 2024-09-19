// This component has been modified from
// https://github.com/mantinedev/ui.mantine.dev/blob/master/lib/PasswordStrength/PasswordStrength.tsx

import getPasswordStrength from "@/lib/auth/getPasswordStrength";
import passwordRequirements from "@/lib/auth/passwordRequirements";
import { Group, Progress } from "@mantine/core";
import PasswordRequirement from "./PasswordRequirement";

interface PasswordStrengthProps {
  value: string;
}

export function PasswordStrength({ value }: PasswordStrengthProps) {
  const strength = getPasswordStrength(value);
  const checks = passwordRequirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(value)}
    />
  ));
  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        styles={{ section: { transitionDuration: "0ms" } }}
        value={
          value.length > 0 && index === 0
            ? 100
            : strength >= ((index + 1) / 4) * 100
              ? 100
              : 0
        }
        color={strength > 80 ? "teal" : strength > 50 ? "yellow" : "red"}
        key={index}
        size={4}
      />
    ));

  return (
    <div>
      <Group gap={5} grow mt="xs" mb="md">
        {bars}
      </Group>

      <PasswordRequirement
        label="Has at least 6 characters"
        meets={value.length > 5}
      />
      {checks}
    </div>
  );
}
