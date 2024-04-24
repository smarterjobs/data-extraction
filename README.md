Data Extraction scripts for all data sources

For a new data source, attempt in order of difficulty
1st option - API request (if there is a source api)
2nd option - pull data with requests/Beautiful soup 
3rd option - set up scraper with selenium (python) or puppeteer (javascript) 

How to run: 
    clone this repo 
    run yarn install or npm install 
    either run yarn run dev OR npx ts-node src/index.ts

How to set up typescript locally: https://dev.to/caelinsutch/building-a-web-scraper-in-typescript-14l1

docker:
    [replace the tag]
    docker build . --tag us-east1-docker.pkg.dev/smarterjobs/smarter-repo/data-extraction:tag6
    !docker run doesnt seem to work but you can run manually in the desktop app
    [to push to gcloud artifact registry:]
    docker push  us-east1-docker.pkg.dev/smarterjobs/smarter-repo/data-extraction:tag6

    Our new image was successfully pushed to Artifact Registry, but our cloud run job is still running the tag1 image. We'll need to manually update the job to build the tag2 image.

    Find your job in the Cloud Run dashboard
    Click Edit
    Update the Container Image URL to point at the new image you just pushed to Artifact Registry

    Click Update


i used the two below articles to help me deploy to gcloud artifact registry and cloud run 
https://www.practiceprobs.com/blog/2022/12/15/how-to-schedule-a-python-script-with-docker-and-google-cloud/#__tabbed_3_1
https://cloud.google.com/run/docs/building/containers?authuser=1


datePosted,
 title,
 company,
 description,
 additionalInfo,
 salary,
 salaryRange,
 contractType,
 perks,
 location,
 country,
 applicationLink,
 emailApplication,
 tags,
 dateFound,
 numLinkClicks

 date_posted:STRING,
 job_title:STRING,
 company:STRING,
 job_description:STRING,
 additional_info:STRING,
 salary:STRING,
 salary_range:STRING,
 contractType:STRING,
 perks:STRING,
 location:STRING,
 country:STRING,
 application_link:STRING,
 emailApplication:STRING,
 tags:STRING,
 num_applications:STRING,
 date_found:STRING