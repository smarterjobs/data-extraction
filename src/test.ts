import { Storage } from "@google-cloud/storage";
import { Logger, readJsonFromGcp, sendTelegramMessage } from "./lib/helpers";
import axios from 'axios';
import * as cheerio from 'cheerio';


const logger = new Logger();


// logger.log('test1')
// logger.log("error test", 50)

// console.log(logger.attemptedExtractions)
// console.log(logger.incrementAttempted())
// console.log(logger.attemptedExtractions)




async function fetchJobData(links: string[]) {
    const dateFound = new Date().toISOString();

    const jobData = []

    const apiPrefix = 'https://cryptojobslist.com/api/jobs/'
    for (let link of links) {
        const url = apiPrefix + link.split('/').slice(2).join('/')
        // console.log(`fetching data from: ${url}`)

        // datePosted, title, company, description, additionalInfo, salary, salaryRange, contractType, perks, location, country, applicationLink, emailApplication, tags, dateFound, numLinkClicks
        try {
            const page = await axios.get(url)
            const data = page.data.job;

            const descriptionHtml = cheerio.load(data.jobDescription);
            console.log(descriptionHtml('*').text())

            const trimmedData = [
                data.publishedAt,
                data.jobTitle,
                data.companyName,
                `${data.jobDescription.trim()}`,
                '',
                data.salary,
                data.salaryRange,
                data.employmentType,
                '',
                data.jobLocation,
                '',
                data.applicationLink,
                '',
                data.tags,
                data.applicationLinkClicks,
                dateFound
            ]

            jobData.push(trimmedData)
            // console.log(`description: ${data.jobDescription}`)

        } catch (error) {
            console.error(`Error pulling job data for ${url}: ${error}`);

        }
    }
    return jobData

}
// const d= fetchJobData(['cryptojobslist.com/jobs/project-manager-binance-france-paris'])





async function test() {
    const storage = new Storage();
    const gcs = storage.bucket('smarter-jobs'); // Removed "gs://" from the bucket name
    const options = {
      destination: 'test/test.csv',
      // Optional:
      // Set a generation-match precondition to avoid potential race conditions
      // and data corruptions. The request to upload is aborted if the object's
      // generation number does not match your precondition. For a destination
      // object that does not yet exist, set the ifGenerationMatch precondition to 0
      // If the destination object already exists in your bucket, set instead a
      // generation-match precondition using its generation number.
      // preconditionOpts: {ifGenerationMatch: generationMatchPrecondition},
    };
  
    const success = await storage.bucket('smarter-jobs').upload(process.cwd()+'/output/crypto-jobs-list-2024-04-20T16:39:35.033Z.csv', options);
    // console.log(`success: ${JSON.stringify(success)}`)
    
}
// test()

// "token": "***REMOVED***",
// "chatId": "***REMOVED***"
// sendTelegramMessage('testing...', "***REMOVED***", "***REMOVED***")



// const s = String.raw`alkjfaw\n akjdfa \n \n\n jajajaslf\nalaj`
const s = "alkjfaw\n akjdfa \n \n\n jajajaslf\nalaj"
const cleaned = s.replace(/\n/g, "")
console.log(s)
console.log(cleaned)