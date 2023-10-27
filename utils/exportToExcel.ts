import { utils, writeFile } from "xlsx";

interface ExportToExcelProps {
  data: object[];
  filename: string;
}

export function exportToExcel({ data, filename }: ExportToExcelProps) {
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Sheet1");
  writeFile(workbook, filename);
}
