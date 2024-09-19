import prisma from "@/lib/prisma";
import { Project } from "@prisma/client";

export async function getProjectById(projectId: string): Promise<Project> {
  let project: Project = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
  });

  return project;
}

export async function createProject(
  projectName: string,
  projectDescription: string,
  teamId: string
) {
  return prisma.project.create({
    data: {
      name: projectName,
      description: projectDescription,
      teamId: teamId,
    },
    include: {
      _count: {
        select: {
          clips: true,
          files: true,
          notes: true,
          tags: true,
        },
      },
    },
  });
}

/**
 * Deletes a project, given its ID.
 * @param projectId The ID of the project to delete.
 * @returns A Promise resolving to void.
 * @throws Will throw an error if the Prisma query fails.
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error in deleteProject: ${error.message}`);
    } else {
      console.error(`An unknown error occurred in deleteProject`);
    }
    throw error;
  }
}
