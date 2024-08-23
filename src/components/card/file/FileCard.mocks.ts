import { IFileCard } from "./FileCard";

const base: IFileCard = {
  file: {
    id: "a",
    name: "Acme Redesign",
    description: "A redesign of the Acme website.",
    // @ts-ignore
    createdAt: "2023-06-24T02:17:01.336Z",
    // @ts-ignore
    updatedAt: "2023-06-24T02:17:01.336Z",
    projectId: "b",
  },
};

export const mockFileCardProps = {
  base,
};
