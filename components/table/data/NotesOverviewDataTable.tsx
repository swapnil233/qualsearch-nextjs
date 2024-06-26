import { useNotes } from "@/contexts/NotesContext";
import { exportToExcel } from "@/lib/export/exportToExcel";
import HighlightSearch from "@/lib/highlightSearchTerm";
import { host } from "@/lib/host";
import { NoteWithTagsAndCreator } from "@/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Input,
  MultiSelect,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Tag } from "@prisma/client";
import {
  IconChevronDown,
  IconDatabaseOff,
  IconDownload,
  IconExternalLink,
  IconListSearch,
  IconShare,
  IconTag,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

interface INotesOverviewDataTable {
  teamId: string;
  projectId: string;
  openNoteDeletionModal: (_noteId: string) => void;
}

const NotesOverviewDataTable: React.FC<INotesOverviewDataTable> = ({
  teamId,
  projectId,
  openNoteDeletionModal,
}) => {
  const { notes } = useNotes();
  // Search and filter states
  const [search, setSearch] = useState("");
  const [filteredNotes, setFilteredNotes] =
    useState<NoteWithTagsAndCreator[]>(notes);
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const itemsPerPageOptions = [5, 10, 20, 50, 100];

  // Total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredNotes.length / itemsPerPage);
  }, [filteredNotes, itemsPerPage]);

  // Current notes to display
  const currentNotes = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return filteredNotes.slice(startIdx, endIdx);
  }, [currentPage, itemsPerPage, filteredNotes]);

  // Select options for items per page
  const selectOptions = itemsPerPageOptions.map((option) => ({
    value: option.toString(),
    label: `${option}`,
  }));

  const largeScreen = useMediaQuery("(min-width: 60em)");

  const tagsUsed = useMemo(() => {
    return notes
      .reduce<Tag[]>((acc, note) => {
        note.tags.forEach((tag) => {
          if (!acc.some((existingTag) => existingTag.id === tag.id)) {
            acc.push(tag);
          }
        });
        return acc;
      }, [])
      .map((tag) => ({
        value: tag.id,
        label: tag.name,
      }));
  }, [notes]);

  const participants = useMemo(() => {
    return (
      notes
        .reduce<string[]>((acc, note) => {
          const participantName = note.file.participantName;
          // participantName can be null since the schema made it optional, so check for that
          if (participantName && !acc.includes(participantName)) {
            acc.push(participantName);
          }
          return acc;
        }, [])
        .map((participant) => ({
          value: participant,
          label: participant,
        })) || []
    );
  }, [notes]);

  // Combined filtering logic
  useEffect(() => {
    const searchLower = search.toLowerCase();

    const filteredNotes = notes.filter((note) => {
      // Search filter
      const matchesSearch =
        note.text.toLowerCase().includes(searchLower) ||
        note.transcriptText.toLowerCase().includes(searchLower);

      // Tag filter
      const matchesTags =
        filteredTags.length === 0 ||
        filteredTags.every((tagId) =>
          note.tags.some((tag) => tag.id === tagId)
        );

      // Participant filter
      const matchesParticipants =
        !filteredParticipants ||
        note.file
          .participantName!.toLowerCase()
          .includes(filteredParticipants.toLowerCase());

      return matchesSearch && matchesTags && matchesParticipants;
    });

    setFilteredNotes(filteredNotes);
  }, [search, filteredTags, filteredParticipants, notes]);

  const exportData = notes.map((note) => ({
    Note: note.text,
    Quote: note.transcriptText,
    Participant: note.file.participantName || "",
    Organization: note.file.participantOrganization || "",
    "Date conducted": note.file.dateConducted
      ? new Date(note.file.dateConducted).toDateString()
      : "",
    Tags: note.tags.map((tag) => tag.name).join(", "),
    "Date created": new Date(note.createdAt).toDateString(),
    "Created by": note.createdBy.name,
    "File link": `${host}/teams/${teamId}/projects/${projectId}/files/${note.fileId}/?noteId=${note.id}`,
  }));

  return (
    <div>
      <Group
        mb="md"
        w={"100%"}
        position="apart"
        align="end"
        noWrap={largeScreen}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: largeScreen ? "row" : "column",
            alignItems: "baseline",
            gap: "1rem",
            width: "100%",
            flexWrap: "nowrap",
          }}
        >
          <Input.Wrapper
            label="Filter by note"
            w={"100%"}
            maw={largeScreen ? 400 : "100%"}
          >
            <Input
              placeholder="Start typing to filter notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<IconListSearch />}
            />
          </Input.Wrapper>

          <MultiSelect
            label="Filter by tags"
            placeholder="Notes with all selected tags..."
            value={filteredTags}
            onChange={setFilteredTags}
            data={tagsUsed}
            clearSearchOnBlur
            searchable
            clearable
            icon={<IconTag size={"1.1rem"} />}
            w={"100%"}
            maw={largeScreen ? 400 : "100%"}
          />

          {participants.length > 0 && (
            <Select
              icon={<IconUser size={"1.1rem"} />}
              label="Filter by participant"
              value={filteredParticipants}
              onChange={(value) => setFilteredParticipants(value!)}
              data={participants}
              styles={{ rightSection: { pointerEvents: "none" } }}
              w={"100%"}
              maw={largeScreen ? 400 : "100%"}
              clearable
            />
          )}

          <Select
            label="Items / page"
            value={itemsPerPage.toString()}
            onChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page when items per page change
            }}
            data={selectOptions}
            rightSection={<IconChevronDown size="1rem" />}
            rightSectionWidth={30}
            styles={{ rightSection: { pointerEvents: "none" } }}
            w={"100%"}
            maw={largeScreen ? 400 : "100%"}
          />
        </Box>
        <Button
          leftIcon={<IconDownload size={"1rem"} />}
          disabled={filteredNotes.length === 0}
          onClick={() =>
            exportToExcel({ data: exportData, filename: "export.xlsx" })
          }
        >
          Export to Excel
        </Button>
      </Group>

      <Text size="sm">
        Showing {currentNotes.length} of {notes.length} notes
      </Text>

      <ScrollArea>
        <Table striped highlightOnHover withBorder>
          <thead>
            <tr>
              <th>Note</th>
              <th>Quote</th>
              <th>Participant</th>
              <th>Organization</th>
              <th>Date conducted</th>
              <th>Tags</th>
              <th>Created by</th>
              <th>Date created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentNotes.length > 0 ? (
              currentNotes.map((note) => (
                <tr key={note.id}>
                  <td>
                    <HighlightSearch text={note.text} search={search} />
                  </td>
                  <td>
                    {`"`}
                    <HighlightSearch
                      text={note.transcriptText.trim()}
                      search={search}
                    />
                    {`"`}
                  </td>
                  <td>{note.file.participantName || "-"}</td>
                  <td>{note.file.participantOrganization || "-"}</td>
                  <td>
                    {note.file.dateConducted
                      ? new Date(note.file.dateConducted).toDateString()
                      : "-"}
                  </td>
                  <td>
                    <Stack spacing={"xs"}>
                      {note.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/teams/${teamId}/projects/${projectId}/tags/${tag.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Badge radius="xs" variant="filled" mr="md">
                            {tag.name}
                          </Badge>
                        </Link>
                      ))}
                    </Stack>
                  </td>
                  <td>
                    <Link
                      href={`/teams/${teamId}/people/${note.createdByUserId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Group noWrap align="center">
                        <Avatar
                          src={note.createdBy.image}
                          alt={note.createdBy.name || ""}
                          radius="xl"
                          size={30}
                        />
                        <Stack spacing={0}>
                          <Text truncate>{note.createdBy.name}</Text>
                        </Stack>
                      </Group>
                    </Link>
                  </td>
                  <td>{new Date(note.createdAt).toDateString()}</td>
                  <td>
                    <Stack>
                      <Link
                        href={`/teams/${teamId}/projects/${projectId}/files/${note.fileId}/?noteId=${note.id}`}
                        target="_blank"
                      >
                        <Tooltip label="Go to note">
                          <ActionIcon variant="filled" color="blue">
                            <IconExternalLink size="1.125rem" />
                          </ActionIcon>
                        </Tooltip>
                      </Link>

                      <Tooltip label="Share">
                        <ActionIcon variant="filled" color="blue">
                          <IconShare size="1.125rem" />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Delete">
                        <ActionIcon
                          variant="filled"
                          color="red"
                          onClick={() => openNoteDeletionModal(note.id)}
                        >
                          <IconTrash size="1.125rem" />
                        </ActionIcon>
                      </Tooltip>
                    </Stack>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} align="center">
                  <Box
                    p={"1rem"}
                    sx={(theme) => ({
                      color:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[3]
                          : theme.colors.gray[5],
                    })}
                  >
                    <IconDatabaseOff size={36} strokeWidth={1.5} />
                    <Text size={"md"}>No notes found</Text>
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ScrollArea>

      <Group mt={"md"} w={"100%"} position="right">
        <Pagination
          value={currentPage}
          onChange={setCurrentPage}
          total={totalPages}
          onNextPage={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          onPreviousPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        />
      </Group>
    </div>
  );
};

export default NotesOverviewDataTable;
