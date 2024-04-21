
// JOB DATA
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Logger, writeCsvLocal, writeCsvToGcp } from '../lib/helpers';
import { Storage } from '@google-cloud/storage';
// import { CryptoJobsListData } from './types';


interface LocationSchema {
    '@type': string;
    address: {
        [key: string]: any;
    };
}


interface Job {
    id: string;
    jobTitle: string;
    jobDescription: string;
    jobLocation: string;
    locationSchema: LocationSchema;
    salaryRange: string | null;
    salary: number | null;
    category: string;
    tags: string[];
    company: any;
    companyId: string;
    companyAbout: string;
    companyName: string;
    companyTagline: string | null;
    companyLogo: string;
    companyTwitter: string | null;
    companyDiscord: string | null;
    companySlug: string;
    companyVerified: boolean;
    logoDarkMode: string | null;
    companyUrl: string;
    coinSymbol: string | null;
    coinGeckoCoinId: string | null;
    remote: boolean;
    timezone: string | null;
    employmentType: string[];
    paysInCrypto: string | null;
    paysInFiat: string | null;
    paidRelocation: boolean;
    visaSponsor: boolean;
    skills: string[] | null;
    bossPicture: string | null;
    bossName: string | null;
    bossFirstName: string | null;
    bossLastName: string | null;
    bossAbout: string | null;
    bitlyLink: string;
    randomSuffix: string;
    telegramDiscussionLink: string;
    telegramDiscussionRepliesQty: number | null;
    canonicalURL: string | null;
    seoSlug: string;
    resumeRequired: boolean | null;
    applicationLink: string;
    ogImageUrl: string;
    question1: string | null;
    question2: string | null;
    question3: string | null;
    totalViewsCount: number;
    applicationCountV2: number | null;
    applicationLinkClicks: number;
    directApplicationsQty: number;
    isFeatured: boolean;
    featuredAt: string | null;
    publishedAt: string;
    createdAt: string;
    published: boolean;
    lastApplicationAt: string;
    filled: boolean;
    filledAt: string | null;
    bid: number;
    locationEnriched: string | null;
    locationEnhancedStr: string | null;
    locationEnhancedObj: string | null;
    videoApplicationsEnabled: boolean | null;
    videoApplicationsRequired: boolean | null;
    removed: boolean;
    notAJobAd: boolean | null;
    totalJobApplications: number;
    applicationQuantityTitle: string;
    isActive: boolean;
}



interface CryptoJobsListData {
    job: Job;
    relatedJobs: any;
    locations: any[];
    jobPostingJSONLD: any;
    jobStats: boolean;
}

async function fetchJobsList(urlsToScrape: string[]) {
    const links = [];

    for (let url of urlsToScrape) {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const jobs: any = $("tr > td > div > a");

            jobs.each((index, value) => {
                const link = $(value).attr('href');
                links.push(link);
            });


            console.log(`Links retrieved for ${url}`);
        } catch (error) {
            console.error(`Error pulling job links from ${url}: ${error}`);
        }

    }
    return links
}

async function fetchJobData(links: string[], logger: Logger) {
    const dateFound = new Date().toISOString();

    const jobData = []

    const apiPrefix = 'https://cryptojobslist.com/api/jobs/'
    for (let link of links) {
        logger.incrementAttempted()
        const url = apiPrefix + link.split('/').slice(2).join('/')
        logger.log(`fetching data from: ${url}`)

        // datePosted, title, company, description, additionalInfo, salary, salaryRange, contractType, perks, location, country, applicationLink, emailApplication, tags, dateFound, numLinkClicks
        try {
            const page = await axios.get(url)
            const data: Job = page.data.job;
            
            const descriptionHtml = cheerio.load(data.jobDescription);

            const trimmedData = [
                `"${data.publishedAt}"`,
                `"${data.jobTitle}"`,
                `"${data.companyName}"`,
                `"${data.jobDescription.trim()}"`,
                `"${descriptionHtml('*').text()}"`,
                // `"${descriptionHtml('*').text()}"`,
                "",
                `"${JSON.stringify(data?.salary)}"`,
                `"${data.salaryRange}"`,
                `"${data.employmentType}"`,
                "",
                `"${data.jobLocation}"`,
                "",
                `"${data.applicationLink}"`,
                '',
                `"${data.tags}"`,
                `"${data.applicationLinkClicks}"`,
                `"${dateFound}"`
            ]

            jobData.push(trimmedData)
            logger.incrementSucceeded()
            // console.log(`description: ${data.jobDescription}`)

        } catch (error) {
            logger.log(`Error pulling job data for ${url}: ${error}`, 40);

        }
    }
    return jobData


}

export async function cryptoJobsList(cfg: any, storage: Storage, logger:Logger) {


    const columnNames = [
        "date_posted",
        "job_title",
        "company",
        "raw_description",
        "stripped_description",
        "additional_info",
        "salary",
        "salary_range",
        "contractType",
        "perks",
        "location",
        "country",
        "application_link",
        "emailApplication",
        "tags",
        "num_applications",
        "date_found"
    ]

    logger.log("Visiting job pages...")
    const links = await fetchJobsList(cfg['urlsToScrape'])

    logger.log("Fetching individual job data")
    const jobData = await fetchJobData(links, logger)

    const today = new Date().toISOString()
    const fileName = `${cfg['fileName']}-${today}.txt`
    logger.log("writing to GCP..")
    await writeCsvToGcp(
        cfg['bucket'],
        fileName,
        cfg['rawFilePath'],
        columnNames,
        jobData,
        storage,
        logger
    )
    logger.log("Finished Crypto Jobs List extraction")
    
    // writeCsvLocal(fileName, `${process.cwd()}/output/`, columnNames, jobData)

}



