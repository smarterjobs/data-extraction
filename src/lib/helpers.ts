import fs from 'fs'
import { Storage } from '@google-cloud/storage'
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
  // create the dir if it doesnt exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  let csvString = columnNames.join('\t') + '\n'

  const formattedData = data.map((row) => row.join('\t').replace('\n', ''));
  const formattedRows = formattedData.join('\n')
  // console.log(`initial: ${data}`)
  // console.log(`formatted data: ${formattedData}`)
  // console.log(`formatted: ${formattedRows}`)

  csvString = csvString + formattedRows
  const filePath = directory + '/' + fileName

  try {
    fs.writeFileSync(filePath, csvString);
    console.log(`file successfully written to: ${filePath}`)
  } catch (err) {
    console.error(`Error writing file to: ${filePath}, ${err}`);
  }

}

// "/Users/jowen/Desktop/smarterjobs/data-extraction/config/smarterjobs-39b7997b940d.json"
// "smarterjobs"
// bucket="smarter-jobs"
// localStoragePath: '/Users/jowen/Desktop/smarterjobs/data-extraction/output/crypto-jobs-list-2024-04.tsv'
export async function transferToGcp(keyFilenamePath: string, projectId: string, localStoragePath: string, bucketName: string, cloudStoragePath: string) {
  // const { Storage } = require("@google-cloud/storage");
  // first write to tmp local storage, then transfer file to gcp and then clean up tmp storage

  const storage = new Storage({
    projectId: projectId,
    keyFilename: keyFilenamePath,
  });

  try {
    const gcs = storage.bucket(bucketName); // Removed "gs://" from the bucket name
    const result = await gcs.upload(localStoragePath, {
      destination: cloudStoragePath,
      metadata: {
        contentType: "application/plain", // Adjust the content type as needed
      }
    });
    console.log(`${localStoragePath.split('/').pop()} uploaded to smarter-jobs`);

    return result[0].metadata.mediaLink;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }

}

export function writeTsvToGcp(fileName: string, columnNames: string[], data: string[][], keyFilenamePath: string, projectId: string, bucketName: string, cloudStoragePath: string) {
  // 1. write to tmp local storage
  // 2. transfer from tmp to gcp
  // 3. clean up tmp 
  const tmpPath = `${process.cwd()}/tmp`
  writeTsvLocal(fileName, tmpPath, columnNames, data)
  transferToGcp(keyFilenamePath, projectId, `${tmpPath}/${fileName}`, bucketName, cloudStoragePath)
  // try {
  //   fs.unlinkSync(`${tmpPath}/${fileName}`);
  // } catch (error) {
  //   console.log(`error deleting tmp file: ${error}`);
  // }
  
}
