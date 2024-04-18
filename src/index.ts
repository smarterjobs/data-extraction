import axios from 'axios';
import cheerio from 'cheerio';
import { cryptoJobsList } from './sources/CryptoJobsList';
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
    await cryptoJobsList()
    // console.log(`pwed: ${process.cwd()}`)
    // await uploadToGcpStorage('crypto-jobs-list-2024-04.tsv')
}

getSourceData()
