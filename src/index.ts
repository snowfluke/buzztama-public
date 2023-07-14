import puppeteer, { PuppeteerLaunchOptions } from "puppeteer";
const cron = require("node-cron");

// Constant
const USER_AGENT = "";
const OPTIONS: PuppeteerLaunchOptions = {
  headless: "new", // false untuk melihat browser
  userDataDir: "./user_data",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
};
const URL_PAGE = "https://web.facebook.com/stmik.komputamamajenang.9";
const CREDS = {
  EM: "",
  PW: "",
};

// Placeholder
let page: any, browser: any;

// Initialiaze
const initBrowser = async () => {
  browser = await puppeteer.launch(OPTIONS);
};

const initPage = async () => {
  console.log("[v] Membuka laman");
  page = await browser.newPage();
  page.setUserAgent(USER_AGENT);

  console.log("[v] Mengunjungi FB");
  await page.goto("https://web.facebook.com/");
};

const isLogin = async () => {
  const isLoggedIn = await page.evaluate(() => {
    const postBtn = document.querySelector('[aria-label="Create a post"]');
    if (postBtn != null) return true;
    return false;
  });

  return isLoggedIn;
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

  await page.goto(URL_PAGE);
  await page.waitForSelector('div[role="feed"]:nth-child(2)');
};

// Check whether last post is liked
const checkLike = async () => {
  const isLiked = await page.evaluate(() => {
    const LikeBtn = document.querySelector(
      'div[role="feed"]:nth-child(2) > div [aria-posinset="1"] > div :not([class]) > div :not([class]) > div:nth-child(4) > div > div > div:nth-child(1) > div [aria-label="Like"]'
    );
    return LikeBtn == null;
  });

  if (isLiked) console.log("[v] Postingan terbaru sudah di like & share");
  return isLiked;
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

const closingPage = async () => {
  console.log("[v] Menutup laman");
  return page.close();
};

const sleep = (ms = 10000, rd = 15000) => {
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

    const page_url = page.url();
    const page_title = await page.title();
    if (page_url.includes("checkpoint")) {
      console.log("[x] Silakan konfirmasi perangkat!");
      await sleep();
      await closingPage();
      return;
    }
    console.log(page_url, page_title);
    await visit();

    const isLastPostLiked = await checkLike();
    if (isLastPostLiked) return closingPage();

    await doLike();
    closingPage();
  } catch (error: any) {
    console.log("[x] Kesalahan: ", error.message);
    console.log(error);
    closingPage();
  }
};

console.log("[] Buzztama berjalan []");

if (!CREDS.EM || !CREDS.PW || !USER_AGENT) {
  console.log("[x] Akun atau user agent masih kosong");
} else {
  initBrowser().then(async () => {
    try {
      initPage().then(login).catch(console.error);
      cron.schedule("*/30 * * * *", () => {
        console.log("[] Cron dieksekusi []");
        initPage().then(runCron).catch(console.error);
      });
    } catch (error) {
      console.log(error);
    }
  });
}
