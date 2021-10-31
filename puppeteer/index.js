/*
 *  I got too many complaints about my posts,
 *  so I decided to automate the moderation process
 */

const assert = require('assert');
const puppeteer = require('puppeteer');

const target = {
  proto: process.env.PUPPETEER_TARGET_PROTO,
  host: process.env.PUPPETEER_TARGET_HOST,
  port: process.env.PUPPETEER_TARGET_PORT,
  path: process.env.PUPPETEER_TARGET_PATH,
  search: process.env.PUPPETEER_TARGET_SEARCH,
};

const target_url = new URL(
  `${target.proto}://${target.host}:${target.port}/${target.path}?${target.search}`
);

const init = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      // Required for Docker version of Puppeteer
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // This will write shared memory files into /tmp instead of /dev/shm,
      // because Docker’s default for /dev/shm is 64MB
      '--disable-dev-shm-usage',
      // This will allow iframes and other resources to load headlessly
      '--disable-features=site-per-process',
    ]
  });

  const browserVersion = await browser.version();
  console.log(`Started ${browserVersion}`);

  const page = await browser.newPage();
  page
    .on('console', message =>
      console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }) => console.log(message))
    .on('response', response =>
      response.status() >= 400 ? console.log(`${response.status()} ${response.url()}`) : '')
    .on('requestfailed', request =>
      console.log(`${request.failure().errorText} ${request.url()}`))

  process.on('SIGTERM', async function () {
    console.log('Gracefully shutting down.');
    await page.close();
    await browser.close();
  });

  await page.setCookie({
    name: process.env.TOKEN_COOKIE_NAME,
    value: process.env.PUPPETEER_TOKEN_COOKIE_VALUE,
    url: target_url.toString(),
  });

  console.log('Making initial request');
  let response = await page.goto(target_url.toString());

  console.log('Entering main loop');
  while (response.ok) {
    console.log('Reload');
    response = await page.reload();
    await new Promise(res=>setTimeout(res, 10 * 1000));
  }

  console.log('Somthing went wrong with that request... shutting down.');
  await page.close();
  await browser.close();
  process.exit(-1);
};

init();
