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
    docker build . --tag us-east1-docker.pkg.dev/smarterjobs/smarter-repo/data-extraction:tag1
    !docker run doesnt seem to work but you can run manually in the desktop app
    [to push to gcloud artifact registry:]
    docker push  us-east1-docker.pkg.dev/smarterjobs/smarter-repo/data-extraction:tag1

i used the two below articles to help me deploy to gcloud artifact registry and cloud run 
https://www.practiceprobs.com/blog/2022/12/15/how-to-schedule-a-python-script-with-docker-and-google-cloud/#__tabbed_3_1
https://cloud.google.com/run/docs/building/containers?authuser=1