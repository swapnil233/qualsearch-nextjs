import { useNotes } from "@/contexts/NotesContext";
import { exportToExcel } from "@/lib/export/exportToExcel";
import HighlightSearch from "@/lib/highlightSearchTerm";
import { host } from "@/lib/host";
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
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconChevronDown,
  IconDatabaseOff,
  IconExternalLink,
  IconListSearch,
  IconShare,
  IconTable,
  IconTag,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

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
  const { colorScheme } = useMantineColorScheme();
  const { notes } = useNotes();
  // Search and filter states
  const [search, setSearch] = useState("");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const itemsPerPageOptions = [5, 10, 20, 50, 100];

  const filteredNotes = useMemo(() => {
    const searchLower = search.toLowerCase();

    return notes.filter((note) => {
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
        note.file.participantName === filteredParticipants;

      return matchesSearch && matchesTags && matchesParticipants;
    });
  }, [search, filteredTags, filteredParticipants, notes]);

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
    const tagMap = new Map<string, string>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        tagMap.set(tag.id, tag.name);
      });
    });

    return Array.from(tagMap).map(([id, name]) => ({ value: id, label: name }));
  }, [notes]);

  // Using Set to get unique participants
  const participants = useMemo(() => {
    const participantSet = new Set<string>();
    notes.forEach((note) => {
      if (note.file.participantName) {
        participantSet.add(note.file.participantName);
      }
    });

    // Convert Set to array of objects for Mantine's Select component
    return Array.from(participantSet).map((participant) => ({
      value: participant,
      label: participant,
    }));
  }, [notes]);

  // Export filtered notes to Excel
  const exportData = filteredNotes.map((note) => ({
    Note: note.text,
    Quote: note.transcriptText,
    Participant: note.file.participantName || "",
    Organization: note.file.participantOrganization || "",
    "Date conducted": note.file.dateConducted
      ? new Date(note.file.dateConducted).toDateString()
      : "",
    Tags: note.tags.map((tag) => tag.name).join(", "),
    "Date created": new Date(note.createdAt).toDateString(),
    "Created by": note.createdBy?.name || "Anonymous User",
    "File link": `${host}/teams/${teamId}/projects/${projectId}/files/${note.fileId}/?noteId=${note.id}`,
  }));

  return (
    <div>
      <Group
        mb="md"
        w="100%"
        justify="space-between"
        align="end"
        wrap={largeScreen ? "nowrap" : "wrap"}
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
            w="100%"
            maw={largeScreen ? 400 : "100%"}
          >
            <Input
              placeholder="Start typing..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconListSearch />}
            />
          </Input.Wrapper>

          <MultiSelect
            label="Filter by tags"
            placeholder="Select tag(s)..."
            value={filteredTags}
            onChange={setFilteredTags}
            data={tagsUsed}
            searchable
            clearable
            leftSection={<IconTag size="1.1rem" />}
            w="100%"
            maw={largeScreen ? 400 : "100%"}
          />

          {participants.length > 0 && (
            <Select
              searchable
              leftSection={<IconUser size="1.1rem" />}
              label="Filter by participant"
              placeholder="Select participant"
              value={filteredParticipants}
              onChange={(value) => setFilteredParticipants(value!)}
              data={participants}
              w="100%"
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
            w="100%"
            maw={largeScreen ? 400 : "100%"}
          />
        </Box>
        <Button
          leftSection={<IconTable size="1rem" />}
          disabled={filteredNotes.length === 0}
          onClick={() =>
            exportToExcel({ data: exportData, filename: "export.xlsx" })
          }
        >
          Export
        </Button>
      </Group>

      <Text size="sm">
        Showing {currentNotes.length} of {notes.length} notes
      </Text>

      <ScrollArea>
        <Table striped highlightOnHover withColumnBorders withRowBorders>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "1rem" }}>Note</th>
              <th style={{ textAlign: "left", padding: "1rem" }}>Quote</th>
              <th style={{ textAlign: "left", padding: "1rem" }}>
                Participant
              </th>
              <th style={{ textAlign: "left", padding: "1rem" }}>
                Organization
              </th>
              <th style={{ textAlign: "left", padding: "1rem" }}>
                Date conducted
              </th>
              <th style={{ textAlign: "left", padding: "1rem" }}>Tags</th>
              <th style={{ textAlign: "left", padding: "1rem" }}>Created by</th>
              <th style={{ textAlign: "left", padding: "1rem" }}>
                Date created
              </th>
              <th style={{ textAlign: "left", padding: "1rem" }}>Actions</th>
            </tr>
          </thead>
          <Table.Tbody>
            {currentNotes.length > 0 ? (
              currentNotes.map((note) => (
                <Table.Tr key={note.id}>
                  <Table.Td className="p-4 align-top">
                    <HighlightSearch text={note.text} search={search} />
                  </Table.Td>
                  <Table.Td className="p-4 align-top italic">
                    {`"`}
                    <HighlightSearch
                      text={note.transcriptText.trim()}
                      search={search}
                    />
                    {`"`}
                  </Table.Td>
                  <Table.Td className="p-4 align-top">
                    {note.file.participantName || "-"}
                  </Table.Td>
                  <Table.Td className="p-4 align-top">
                    {note.file.participantOrganization || "-"}
                  </Table.Td>
                  <Table.Td className="p-4 align-top">
                    {note.file.dateConducted
                      ? new Date(note.file.dateConducted).toDateString()
                      : "-"}
                  </Table.Td>
                  <Table.Td className="p-4 align-top">
                    <Stack gap="xs">
                      {note.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/teams/${teamId}/projects/${projectId}/tags/${tag.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Badge radius="xs" variant="filled" mr="md" fullWidth>
                            {tag.name}
                          </Badge>
                        </Link>
                      ))}
                    </Stack>
                  </Table.Td>
                  <Table.Td className="p-4 align-top">
                    <Link
                      href={`/teams/${teamId}/people/${note.createdByUserId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Group wrap="nowrap" align="center">
                        <Avatar
                          src={note.createdBy?.image || "anonUser.png"}
                          alt={note.createdBy?.name || "Anonymous User"}
                          radius="xl"
                          size={30}
                        />
                        <Stack gap={0}>
                          <Text truncate>
                            {note.createdBy?.name || "Anonymous User"}
                          </Text>
                        </Stack>
                      </Group>
                    </Link>
                  </Table.Td>
                  <Table.Td className="p-4 align-top">
                    {new Date(note.createdAt).toDateString()}
                  </Table.Td>
                  <Table.Td
                    className="p-4 align-top"
                    style={{ textAlign: "right" }}
                  >
                    <Stack align="flex-start">
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
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} align="center">
                  <Box
                    p="1rem"
                    style={(theme) => ({
                      color:
                        colorScheme === "dark"
                          ? theme.colors.dark[3]
                          : theme.colors.gray[5],
                    })}
                  >
                    <IconDatabaseOff size={36} strokeWidth={1.5} />
                    <Text size="md">No notes found</Text>
                  </Box>
                </td>
              </tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Group w="100%" align="right" mt="md">
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
