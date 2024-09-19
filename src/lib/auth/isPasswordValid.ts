import passwordRequirements from "./passwordRequirements";

export default function isPasswordValid(password: string | undefined) {
  if (!password || password.length <= 5) return false;
  return passwordRequirements.every((requirement) =>
    requirement.re.test(password)
  );
}
