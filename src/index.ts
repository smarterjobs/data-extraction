import axios from 'axios';
import cheerio from 'cheerio';
import { cryptoJobsList } from './sources/CryptoJobsList';
import { Logger, readJsonFromGcp, sendTelegramMessage } from './lib/helpers';
import { Storage } from '@google-cloud/storage';
// import { uploadToGcpStorage } from './lib/helpers';
// import { cryptoJobsList } from './sources/cryptojobslist';

// https://cryptojobslist.com/api/jobs/backend-engineer-level-2-sde-1-coinshift-bangalore

  

// steps:
// 1. list of jobs
// 2. make subsequent api calls, storing data in a data struct
// 3. then write to dynamo  (actually, this should be done only right at the end (after index.ts has finished executing))


console.log("Data extraction starting...")

async function getSourceData() {
    // console.log("WORKING...")
    const storage = new Storage({
        projectId: "smarterjobs",
        keyFilename: `${process.cwd()}/config/smarterjobs-39b7997b940d.json`,
      });

      const config = await readJsonFromGcp(storage, "smarter-jobs", "config/extractionConfig.json")
      const logger = new Logger()

    // extract crypto jobs list jobs
    logger.log('starting crypto jobs list data extraction')
    await cryptoJobsList(config['cryptoJobsList'], storage, logger)

    logger.log(`Finished data extraction: ${logger.succeededExtractions}/${logger.attemptedExtractions} jobs extracted`)

    // // send message to telegram
    const telegramConfig = await readJsonFromGcp(storage, "smarter-jobs", "config/telegramConfig.json")
    const telegramMessage = logger.errorList.length>0 ? `Errors extracting data: ${logger.errorList} SUCCEEDED: ${logger.succeededExtractions}/${logger.attemptedExtractions}` 
    : `SUCCEEDED: ${logger.succeededExtractions}/${logger.attemptedExtractions}`  
    await sendTelegramMessage(telegramMessage, telegramConfig['token'], telegramConfig['chatId'])

}

getSourceData()
