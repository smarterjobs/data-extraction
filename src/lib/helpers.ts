import fs from 'fs'

/**
 * Writes data to a TSV file locally.
 * 
 * @param fileName - The name of the TSV file.
 * @param directory - The directory path where the TSV file will be saved.
 * @param columnNames - An array containing the names of the columns in the CSV file.
 * @param data - A 2-dimensional array containing the data to be written to the CSV file.
 * @returns Void.
 * @remarks This function creates a TSV string from the provided data and writes it to a file
 * specified by the fileName and directory parameters. Each row of data is joined using the pipe
 * ('|') separator, and each column name is joined to form the header row of the CSV file.
 * 
 * @example
 * ```typescript
 * writeTsvLocally('data.csv', '/path/to/directory/', ['Name', 'Age', 'Country'], [['John', '30', 'USA'], ['Alice', '25', 'Canada']]);
 * ```
 */
export function writeTsvLocal(fileName: string, directory: string, columnNames: string[], data: string[][]) {
  let csvString = columnNames.join('\t') + '\n'

  const formattedData = data.map((row) => row.join('\t').replace('\n', ''));
  const formattedRows = formattedData.join('\n')
  // console.log(`initial: ${data}`)
  // console.log(`formatted data: ${formattedData}`)
  // console.log(`formatted: ${formattedRows}`)

  csvString = csvString + formattedRows

  try {
    fs.writeFileSync(directory + fileName, csvString);
    console.log(`file successfully written to: ${directory + fileName}`)
  } catch (err) {
    console.error(`Error writing file to: ${directory + fileName}, ${err}`);
  }



}