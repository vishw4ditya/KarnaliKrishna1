import XLSX from 'xlsx';

/**
 * Generate Excel (.xlsx) Report from JSON array
 * @param {String} sheetName - Title of the sheet
 * @param {Array} data - Array of key-value objects
 * @param {Object} res - Express Response object
 */
export const generateExcelReport = (sheetName, data, res) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Write to a buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const fileName = `${sheetName.replace(/\s+/g, '_')}-${Date.now()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    res.send(buffer);
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ success: false, message: 'Could not generate Excel report' });
  }
};
