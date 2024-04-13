
    // JOB DATA
    import axios from 'axios';
    import * as cheerio from 'cheerio';
    import { writeCsvLocally } from '../lib/helpers';
    // import { CryptoJobsListData } from './types';
    
    // https://cryptojobslist.com/api/jobs/backend-engineer-level-2-sde-1-coinshift-bangalore
    
    const urlsToScrape = [
        'https://cryptojobslist.com/?sort=recent&page=1',
        'https://cryptojobslist.com/?sort=recent&page=2',
        'https://cryptojobslist.com/?sort=recent&page=3',
        'https://cryptojobslist.com/?sort=recent&page=4',
        'https://cryptojobslist.com/?sort=recent&page=5',
        'https://cryptojobslist.com/?sort=recent&page=6',
        'https://cryptojobslist.com/?sort=recent&page=7',
        'https://cryptojobslist.com/?sort=recent&page=8',
        
    ]
    
    
    
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
    
    async function fetchJobsList() {
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
    
    async function fetchJobData(links: string[]) {
        const dateFound = new Date().toISOString();
    
        const jobData = []
    
        const apiPrefix = 'https://cryptojobslist.com/api/jobs/'
        for (let link of links) {
            const url = apiPrefix + link.split('/').slice(2).join('/')
            console.log(`fetching data from: ${url}`)
            
            // datePosted, title, company, description, additionalInfo, salary, salaryRange, contractType, perks, location, country, applicationLink, emailApplication, tags, dateFound, numLinkClicks
            try {
                const data: Job = (await axios.get(url)).data.job;
    
                const trimmedData = [
                    data.publishedAt,
                    data.jobTitle,
                    data.companyName,
                    data.jobDescription,
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
    
            } catch (error) {
                console.error(`Error pulling job data for ${url}: ${error}`);
    
            }
        }
        return jobData
    
    
    }
    
    
    
    
    export async function cryptoJobsList() {
        const today = new Date().toISOString().
        // const links = await fetchJobsList()
        // console.log(links)
        const jobData = await fetchJobData(['/developer/blockchain-developer-algorithm-global-amber-global'])
        console.log(`writing job data to csv`)
        await writeCsvLocally(`crypto-jobs-list-${}`)
        // console.log(`jobdata length: ${jobData}`)
    }
    
    
    
