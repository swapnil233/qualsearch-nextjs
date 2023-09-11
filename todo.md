# TODO

This document contains the ongoing tasks and improvements for the next.js project.

## Table of Contents

1. [Frontend Tasks](#frontend-tasks)
2. [Backend Tasks](#backend-tasks)
3. [Design Tasks](#design-tasks)
4. [Functionality Tasks](#functionality-tasks)
5. [Database Tasks](#database-tasks)

## Frontend Tasks

| Task   | Description                                               |
| ------ | --------------------------------------------------------- |
| Task 1 | Implement a working "last active" function for team table |
| Task 2 | Implement a search and filters bar                        |

## Backend Tasks

| Task   | Description                                                                     |
| ------ | ------------------------------------------------------------------------------- |
| Task 1 | Implement project deletion feature. Anyone inside the team can delete a project |
| Task 2 | Implement file deletion. Everyone inside the team can delete files              |
| Task 3 | Implement a soft-delete feature for teams, projects, and files                  |

## Design Tasks

| Task   | Description                       |
| ------ | --------------------------------- |
| Task 1 | Create a new page layout template |

## Functionality Tasks

| Task   | Description                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Task 1 | Re-create the "role" property for users. Roles are team-dependant, not a global role that the user has for all teams they're in |
| Task 2 | Implement project statuses. Projects can be in-progress, completed, archived, or terminated                                     |
| Task 3 | Implement a pinning feature for teams, projects and files                                                                       |

## Database Tasks

| Task   | Description                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------- |
| Task 1 | Implement tags in Prisma schema. A project can have many tags. Each tag can be used in files/transcripts |

## Bugs

| Task   | Description                                                                                        |
| ------ | -------------------------------------------------------------------------------------------------- |
| Task 1 | Creating a new tag, then unselecting it still adds it to the list of tags associated with the note |
