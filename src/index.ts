import puppeteer, { PuppeteerLaunchOptions } from "puppeteer";
const cron = require("node-cron");

// Constant
const USER_AGENT = "";
const OPTIONS: PuppeteerLaunchOptions = {
  headless: true,
  userDataDir: "./user_data",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
};
const URL_PAGE = "https://facebook.com/stmik.komputamamajenang.9";
const CREDS = {
  EM: "",
  PW: "",
};

// Placeholder
let page: any, browser: any;

// Initialiaze puppeteer
const init = async () => {
  browser = await puppeteer.launch(OPTIONS);
  page = (await browser.pages())[0];
  page.setUserAgent(USER_AGENT);
};

const isLogin = async () => {
  console.log("[v] Mengunjungi FB");
  await page.goto("https://facebook.com/");

  const isLoggedIn = await page.evaluate(() => {
    const profilePic = document.querySelector('[aria-label="Your profile"]');
    return profilePic !== null;
  });

  if (!isLoggedIn) return false;
  return true;
};

const login = async () => {
  console.log("[v] Mengisi input login ...");

  await page.type("[name='email']", CREDS.EM, {
    delay: random(200),
  });
  await page.type("[name='pass']", CREDS.PW, {
    delay: random(250),
  });

  console.log("[v] Proses login ...");
  await page.click('[name="login"]');

  await page.waitForNavigation();
  console.log("[v] Berhasil login");
};

// Visit the facebook user page
const visit = async () => {
  console.log("[v] Mengunjungi FB STMIK Komputama");
  await sleep();

  await page.goto(URL_PAGE);
  await page.waitForSelector('[aria-label="Stmik Komputama"]');
};

// Check whether last post is liked
const checkLike = async () => {
  const isLiked = await page.evaluate(() => {
    const unlikeExist = document.querySelector(
      'div[role="feed"]:nth-child(2) > div [aria-posinset="1"] > div :not([class]) > div :not([class]) > div:nth-child(4) > div > div > div:nth-child(1) > div [aria-label="Remove Like"]'
    );
    return unlikeExist !== null;
  });

  if (!isLiked) return false;

  console.log("[v] Postingan terbaru sudah di like & share");
  return true;
};

// Do like and share action
const doLike = async () => {
  const likeSelector =
    'div[role="feed"]:nth-child(2) > div [aria-posinset="1"] > div :not([class]) > div :not([class]) > div:nth-child(4) > div > div > div:nth-child(1) > div [aria-label="Like"]';
  const shareSelector =
    'div[role="feed"]:nth-child(2) > div [aria-posinset="1"] > div :not([class]) > div :not([class]) > div:nth-child(4) > div > div > div:nth-child(1) > div [aria-label="Send this to friends or post it on your Timeline."]';
  const shareNowSelector =
    'div [aria-label="Share options"] > div [role="button"]';

  await sleep(3000, 5000);
  console.log("[v] Like post terbaru");
  await page.click(likeSelector);

  console.log("[v] Share post terbaru");
  await sleep(5000, 10000);
  await page.click(shareSelector);

  await page.waitForSelector(shareNowSelector);
  await sleep(1000, 5000);
  await page.click(shareNowSelector);

  await sleep(3000, 5000);
  console.log("[v] Aksi selesai");
};

const closingBrowser = async () => {
  console.log("[v] Menutup browser");
  await browser.close();
};

const sleep = (ms = 10000, rd = 20000) => {
  const randomTime = Math.floor(Math.random() * rd);
  return new Promise((resolve) => {
    setTimeout(resolve, ms + randomTime);
  });
};

const random = (ms: number) => Math.floor(Math.random() * ms);

const runCron = async () => {
  try {
    const isLoggedIn = await isLogin();
    if (!isLoggedIn) await login();

    await visit();

    const isLastPostLiked = await checkLike();
    if (isLastPostLiked) return closingBrowser();

    await doLike();
    closingBrowser();
  } catch (error: any) {
    console.log("[x] Kesalahan: ", error.message);
    console.log(error);
  }
};

console.log("[] Buzztama berjalan []");

if (!CREDS.EM || !CREDS.PW || !USER_AGENT) {
  console.log("[x] Akun atau user agent masih kosong");
} else {
  cron.schedule("*/30 * * * *", () => {
    console.log("[] Cron dieksekusi []");
    init().then(runCron).catch(console.error);
  });
}
