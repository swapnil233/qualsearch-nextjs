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
| Task 1 | Re-write all HTTP calls to use Fetch instead of Axios     |
| Task 2 | Remove file uploads and OpenAI calls from home page       |
| Task 3 | Implement a working "last active" function for team table |

## Backend Tasks

| Task   | Description                                                                     |
| ------ | ------------------------------------------------------------------------------- |
| Task 1 | Implement a callback API endpoint for Deepgram's transcription response         |
| Task 2 | Implement team deletion feature. Only the creator can delete a team             |
| Task 3 | Implement project deletion feature. Anyone inside the team can delete a project |
| Task 4 | Implement file deletion. Everyone inside the team can delete files              |
| Task 5 | Implement a soft-delete feature for teams, projects, and files                  |

## Design Tasks

| Task   | Description                                                                                    |
| ------ | ---------------------------------------------------------------------------------------------- |
| Task 1 | Re-design the page header. Include breadcrumbs, title, primary + secondary action buttons, etc |
| Task 2 | Create a new page layout template                                                              |
| Task 3 | Implement empty states for teams, projects and files                                           |

## Functionality Tasks

| Task   | Description                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Task 1 | Re-create the "role" property for users. Roles are team-dependant, not a global role that the user has for all teams they're in |
| Task 2 | Implement project statuses. Projects can be in-progress, completed, archived, or terminated                                     |
| Task 3 | Implement a pinning feature for teams, projects and files                                                                       |
| Task 4 | Let users also upload video files, and file pages will have a video ref instead of an audio ref                                 |
| Task 5 | Implement transcript summary and sentiment using GPT                                                                            |
| Task 6 | Look into using Prose Mirror for transcripts and tagging                                                                        |

## Database Tasks

| Task   | Description                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------- |
| Task 1 | Implement tags in Prisma schema. A project can have many tags. Each tag can be used in files/transcripts |
| Task 2 | Create a separate model for a file's transcript                                                          |
