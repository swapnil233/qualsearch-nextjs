import { IProjectCard } from "./ProjectCard";

const base: IProjectCard = {
  project: {
    id: "a",
    name: "Acme Redesign",
    description: "A redesign of the Acme website.",
    // @ts-ignore
    createdAt: "2023-06-24T02:17:01.336Z",
    // @ts-ignore
    updatedAt: "2023-06-24T02:17:01.336Z",
    teamId: "b",
  },
};

export const mockProjectCardProps = {
  base,
};
