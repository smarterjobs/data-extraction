import axios from 'axios';
import cheerio from 'cheerio';
import { cryptoJobsList } from './sources/CryptoJobsList';
// import { cryptoJobsList } from './sources/cryptojobslist';

// https://cryptojobslist.com/api/jobs/backend-engineer-level-2-sde-1-coinshift-bangalore

  

// steps:
// 1. list of jobs
// 2. make subsequent api calls, storing data in a data struct
// 3. then write to dynamo  (actually, this should be done only right at the end (after index.ts has finished executing))


console.log("working!")

async function getSourceData() {
    await cryptoJobsList()
}

getSourceData()
