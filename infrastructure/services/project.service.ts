import prisma from "@/utils/prisma";

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
          tags: true
        }
      }
    }
  });
}
