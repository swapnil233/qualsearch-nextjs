import { IInvitationsTable } from "./InvitationsTable";

const base: IInvitationsTable = {
  invitations: [
    {
      id: "clj9cz7540000jlp0zq6k318f",
      teamName: "Acme UX Team",
      teamDescription: "",
      createdAt: "Mon Jul 03 2023",
    },
    {
      id: "jdjdjdjdd",
      teamName: "Brave UX Team",
      teamDescription: "A team for Brave's UX department.",
      createdAt: "Mon Jul 03 2023"
    }
  ],
  handleAcceptInvitation: () => { },
  handleDeclineInvitation: () => { },
};

export const mockInvitationsTableProps = {
  base,
};
