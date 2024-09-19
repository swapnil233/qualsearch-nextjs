import { zodResolver } from "@hookform/resolvers/zod";
import { notifications } from "@mantine/notifications";
import { User, UserPreferences } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { z } from "zod";

interface PersonalInfoFormData {
  name: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  contactTimePreference: string;
  darkMode: boolean;
  language: string;
  newsletterSubscribed: boolean;
}

const schema = z.object({
  name: z.string().min(1, "Full name is required"),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  contactTimePreference: z.enum(["MORNING", "AFTERNOON", "EVENING"]).optional(),
  darkMode: z.boolean(),
  language: z.string().optional(),
  newsletterSubscribed: z.boolean(),
});

const usePersonalInfoForm = (user: User, preferences: UserPreferences) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name || "",
      emailNotifications: preferences.emailNotifications,
      smsNotifications: preferences.smsNotifications,
      pushNotifications: preferences.pushNotifications,
      contactTimePreference: preferences.contactTimePreference || "MORNING",
      darkMode: preferences.darkMode || false,
      language: preferences.language || "en",
      newsletterSubscribed: preferences.newsletterSubscribed || true,
    },
  });

  const mutation = useMutation(
    async (data: PersonalInfoFormData) => {
      const response = await fetch("/api/users/updateUserPreferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user.id, ...data }),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    {
      onMutate: async (newData) => {
        await queryClient.cancelQueries("user");
        const previousUser = queryClient.getQueryData<User>("user");
        if (previousUser) {
          queryClient.setQueryData<User>("user", {
            ...previousUser,
            ...newData,
          });
        }
        return { previousUser };
      },
      onError: (_error, _newData, context) => {
        if (context?.previousUser) {
          queryClient.setQueryData("user", context.previousUser);
        }
        notifications.show({
          title: "We couldn't save your changes",
          message: "Something went wrong on our end. Please try again later.",
          color: "red",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries("user");
      },
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Your changes have been saved.",
          color: "green",
        });
      },
    }
  );

  const onSubmit = (data: PersonalInfoFormData) => {
    mutation.mutate(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading: mutation.isLoading,
    setValue,
    watch,
  };
};

export default usePersonalInfoForm;
