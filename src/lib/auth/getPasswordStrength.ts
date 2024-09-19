import passwordRequirements from "./passwordRequirements";

export default function getPasswordStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

  passwordRequirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(
    100 - (100 / (passwordRequirements.length + 1)) * multiplier,
    0
  );
}
