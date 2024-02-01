import XLSX from "xlsx";

class ExcelComponent {
  /**
   * Reads an Excel file.
   * @private
   * @static
   * @param {Object} params - The parameters.
   * @param {string} params.filePath - The path of the file to read.
   * @returns {Object} The workbook object.
   */
  static #readFile = ({ filePath }) => XLSX.readFile(filePath);

  /**
   * Creates an Excel file.
   * @static
   * @param {Object} params - The parameters.
   * @param {string} params.filePath - The path of the file to create.
   * @param {Array} params.data - The data to write to the file.
   * @param {string} params.nameFile - The name of the file.
   */
  static createFile = ({ filePath, data, nameFile }) => {
    const book = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(book, sheet, nameFile);
    XLSX.writeFile(book, filePath);
  };

  /**
   * Reads a sheet from an Excel file.
   * @static
   * @param {Object} params - The parameters.
   * @param {string} params.filePath - The path of the file to read.
   * @param {number} params.indexSheet - The index of the sheet to read.
   * @returns {Object} The sheet object.
   */
  static readSheet = ({ filePath, indexSheet }) => {
    const workbook = this.#readFile({ filePath });
    const sheetName = workbook.SheetNames[indexSheet];
    return workbook.Sheets[sheetName];
  };

  /**
   * Converts a worksheet to JSON.
   * @static
   * @param {Object} params - The parameters.
   * @param {Object} params.worksheet - The worksheet to convert.
   * @param {Object} [params.options={ header: 1 }] - The options for conversion.
   * @returns {Array} The JSON representation of the worksheet.
   */
  static convertToJson = ({ worksheet, options = { header: 1 } }) =>
    XLSX.utils.sheet_to_json(worksheet, options);

  /**
   * Reads the index of a column in a row.
   * @static
   * @param {Object} params - The parameters.
   * @param {Array} params.rows - The rows to search.
   * @param {string} params.columnName - The name of the column to find.
   * @returns {number} The index of the column.
   */
  static readIndexColumn = ({ rows, columnName }) => {
    const column = rows[0].findIndex((col) => col === columnName);
    return column;
  };

  /**
   * Returns the first result from a column in a set of rows.
   * @static
   * @param {Object} params - The parameters.
   * @param {Array} params.rows - The rows to search.
   * @param {string} params.columnName - The name of the column to find.
   * @param {boolean} [params.isNumber=false] - Whether to return only numeric results.
   * @returns {string|number} The first result.
   */
  static returnFirnResult = ({ rows, columnName, isNumber = false }) => {
    const column = this.readIndexColumn({ rows, columnName });
    const result = rows.slice(1).map((row) => row[column]);

    if (isNumber) {
      return result.find((value) => !isNaN(value));
    }

    return result;
  };
}

export default ExcelComponent;
