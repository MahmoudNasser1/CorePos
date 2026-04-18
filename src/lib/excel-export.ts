import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file (.xlsx)
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the sheet
 */
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  // 1. Create a work sheet from the JSON data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 2. Create a work book and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 3. Write and download the file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Formats report data for Excel export (removes non-readable characters, formats dates, etc.)
 */
export const formatDataForExport = (data: any[], columns: { key: string; label: string }[]) => {
  return data.map((item) => {
    const formattedItem: any = {};
    columns.forEach((col) => {
      let value = item[col.key];
      
      // Basic formatting can be added here
      if (value === null || value === undefined) {
        value = '';
      }
      
      formattedItem[col.label] = value;
    });
    return formattedItem;
  });
};
