import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { z } from "zod";

const registrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const useRegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const mutation = useMutation(
    async (data: RegistrationFormData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      return response.json();
    },
    {
      onSuccess: async (_, variables) => {
        notifications.show({
          title: "Registration successful",
          message: "You have been successfully registered.",
          color: "green",
        });

        // Automatically sign in the user
        const result = await signIn("credentials", {
          redirect: true,
          callbackUrl: "/teams",
          email: variables.email,
          password: variables.password,
        });

        if (result?.error) {
          notifications.show({
            title: "Login failed",
            message: "We couldn't log you in. Please try again.",
            color: "red",
          });
        }
      },
      onError: (error: Error) => {
        notifications.show({
          title: "Registration failed",
          message:
            error.message ||
            "An unexpected error occurred. Please try again later.",
          color: "red",
        });
      },
    }
  );

  const onSubmit = (data: RegistrationFormData) => {
    mutation.mutate(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading: mutation.isLoading,
    watch,
    setValue,
  };
};

export default useRegistrationForm;
