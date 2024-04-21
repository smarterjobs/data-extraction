import fs from 'fs'
import { Storage } from '@google-cloud/storage';
import axios from 'axios';


export class Logger {
  private logLevel = {
    20: "INFO",
    30: "WARNING",
    40: "ERROR",
    50: "CRITICAL"
  }
  public logList: string[] = [];
  public errorList: string[] = [];
  public attemptedExtractions = 0;
  public succeededExtractions = 0;

  public log(text: string, level: 20 | 30 | 40 | 50 = 20) {
    const now = new Date().toISOString();
    const logMessage = `${this.logLevel[level]} ${now} ${text}`

    this.logList.push(logMessage);
    (level > 20) && this.errorList.push(logMessage)

    console.log(logMessage)
  }

  public incrementAttempted() {
    this.attemptedExtractions++
  }
  public incrementSucceeded() {
    this.succeededExtractions++
  }
}


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
export async function writeCsvLocal(fileName: string, directory: string, columnNames: string[], data: string[][]) {
  // create the dir if it doesnt exist
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  let csvString = columnNames.join('|') + '\n'

  const formattedData = data.map((row) => row.join('|').replace(/\n/g, ""));
  const formattedRows = formattedData.join('\n')
  // console.log(`initial: ${data}`)
  // console.log(`formatted data: ${formattedData}`)
  // console.log(`formatted: ${formattedRows}`)

  csvString = csvString + formattedRows
  const filePath = directory + '/' + fileName

  try {
    fs.writeFileSync(filePath, csvString);
    console.log(`local file written to: ${filePath}`)
  } catch (err) {
    console.error(`Error writing file to: ${filePath}, ${err}`);
  }

}


export async function transferToGcp(localStoragePath: string, bucketName: string, cloudStoragePath: string, storage: Storage, logger: Logger) {
  // const { Storage } = require("@google-cloud/storage");
  // first write to tmp local storage, then transfer file to gcp and then clean up tmp storage

  try {
    // const gcs = storage.bucket(bucketName); // Removed "gs://" from the bucket name
    
    const options = {
      destination: cloudStoragePath,
      // Optional:
      // Set a generation-match precondition to avoid potential race conditions
      // and data corruptions. The request to upload is aborted if the object's
      // generation number does not match your precondition. For a destination
      // object that does not yet exist, set the ifGenerationMatch precondition to 0
      // If the destination object already exists in your bucket, set instead a
      // generation-match precondition using its generation number.
      // preconditionOpts: {ifGenerationMatch: generationMatchPrecondition},
    };

    // console.log(`bucketname: ${bucketName}, cloudStoragePath: ${cloudStoragePath}, localStoragePath: ${localStoragePath}`)
    await storage.bucket(bucketName).upload(localStoragePath, options);

    logger.log(`${localStoragePath.split('/').pop()} uploaded to GCP`);

    // return result[0].metadata.mediaLink;
  } catch (e) {
    logger.log(`Unable to transfer to GCP: ${e}`, 50);
    throw new Error(e.message);
  }

}

export async function writeCsvToGcp(bucketName: string, fileName: string, cloudStorageFolder: string, columnNames: string[], data: string[][], storage: Storage, logger: Logger) {
  // 1. write to tmp local storage
  // 2. transfer from tmp to gcp
  // 3. clean up tmp 
  const tmpPath = `${process.cwd()}/tmp`

  await writeCsvLocal(fileName, tmpPath, columnNames, data)
  await transferToGcp(`${tmpPath}/${fileName}`, bucketName, cloudStorageFolder + fileName, storage, logger)

  try {
    fs.unlinkSync(`${tmpPath}/${fileName}`);
  } catch (error) {
    logger.log(`error deleting tmp file: ${error}`, 50);
  }

}



export async function readJsonFromGcp(storage: Storage, bucketName: string, configFilePath: string) {
  const configFile = await storage.bucket(bucketName).file(configFilePath).download();
  return await JSON.parse(configFile[0].toString('utf8'));


}
export async function sendTelegramMessage(message: string, token: string, chatId: string) {

  await axios.get(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`)
}