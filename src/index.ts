import puppeteer, { PuppeteerLaunchOptions } from "puppeteer";
const cron = require("node-cron");

// Constant
const SUPER_AGENT =
  "Mozilla/5.0 (Linux; Android 10; SM-A107F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36";
const OPTIONS: PuppeteerLaunchOptions = {
  headless: true,
  userDataDir: "./user_data",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
};
const URL_PAGE = "https://m.facebook.com/stmik.komputamamajenang.9";
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
  page.setUserAgent(SUPER_AGENT);
  // await page.setViewport({ width: 800, height: 600 });
};

const isLogin = async () => {
  console.log("[v] Mengunjungi FB");
  await page.goto("https://m.facebook.com/");

  const isLoggedIn = await page.evaluate(() => {
    const facebookLogo = document.querySelector("div.m.displayed");
    return facebookLogo !== null;
  });

  if (!isLoggedIn) return false;
  return true;
};

const login = async () => {
  await sleep();
  console.log("[v] Mengisi input login ...");

  await page.type("#m_login_email", CREDS.EM, {
    delay: random(200),
  });
  await page.type("#m_login_password", CREDS.PW, {
    delay: random(250),
  });

  console.log("[v] Proses login ...");
  await page.click('[name="login"]');
  await page.waitForNavigation();

  console.log("[v] Berhasil login");
  await sleep();

  const isNotNow = await page.evaluate(() => {
    const notNowBtn = document.querySelector(
      'a[href^="/login/save-device/cancel/"]'
    );
    return notNowBtn !== null;
  });

  if (isNotNow) {
    console.log("[v] Tombol Not Now terdeteksi, mengalihkan ...");
    await page.click('a[href^="/login/save-device/cancel/"]');
  }
};

// Visit the facebook user page
const visit = async () => {
  await sleep();

  console.log("[v] Mengunjungi FB STMIK Komputama");
  const titlePageSelector =
    "#screen-root > div > div.m.fixed-container.top > div:nth-child(2) > div.m.bg-s3 > div:nth-child(2) > h2 > span";

  await page.goto(URL_PAGE);
  await page.waitForSelector(titlePageSelector);

  const title = await page.$eval(
    titlePageSelector,
    (el: any) => el.textContent
  );

  if (title !== "Stmik Komputama") throw "Bukan akun FB STMIK Komputama";
  return true;
};

// Check last post (number 2 after pinned post)
const checkLastPost = async () => {
  await sleep();

  const post2Selector =
    "#screen-root > div > div:nth-child(2) > div:nth-child(21) > div:nth-child(2)";
  const titlePostSelector =
    "#screen-root > div > div.m.fixed-container.top > div:nth-child(2) > div > div > div:nth-child(2) > h1 > span";

  await page.waitForSelector(post2Selector);
  console.log("[v] Mengecek post terbaru");

  await page.click(post2Selector);
  await page.waitForSelector(titlePostSelector);

  const titlePost = await page.$eval(
    titlePostSelector,
    (el: any) => el.textContent
  );

  if (titlePost !== "Stmik's post") throw "Bukan postingan STMIK Komputama";
};

// Check whether last post is liked
const isLiked = async () => {
  const like = await page.evaluate(() => {
    const likeClean = document.querySelector(
      "#screen-root > div > div:nth-child(2) > div:nth-child(7) > div:nth-child(1) > div > button > span:nth-child(1)[style='color:#ffffff;']"
    );
    return likeClean == null;
  });

  if (!like) return false;

  console.log("[v] Postingan terbaru sudah di like & share");
  return true;
};

// Do like and share action
const doLike = async () => {
  await sleep();
  console.log("[v] Like post terbaru");

  const likeSelector =
    "#screen-root > div > div:nth-child(2) > div:nth-child(7) > div:nth-child(1) > div > button > span:nth-child(1)[style='color:#ffffff;']";
  const shareSelector =
    "#screen-root > div > div:nth-child(2) > div:nth-child(7) > div:nth-child(3) > div > button";
  const sharePublicSelector =
    "#screen-root > div.m.bg-s1.dark-mode.dialog-screen > div.m.fixed-container.bottom > div > div > div > div > div.m.bg-s3 > div:nth-child(1) > div";
  const postBtnSelector =
    "#screen-root > div > div:nth-child(2) > div:nth-child(11) > div";

  await page.click(likeSelector);

  console.log("[v] Share post terbaru");
  await sleep(5000, 10000);

  await page.click(shareSelector);
  await page.waitForSelector(sharePublicSelector);

  await sleep(5000, 10000);
  await page.click(sharePublicSelector);

  await sleep(3000, 5000);
  await page.waitForSelector(postBtnSelector);
  await page.click(postBtnSelector);

  console.log("[v] Aksi selesai");
};

const closingBrowser = async () => {
  console.log("[v] Menutup browser");
  await browser.close();
};

const sleep = (ms = 10000, rd = 30000) => {
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
    await checkLastPost();

    const isLastPostLiked = await isLiked();
    if (isLastPostLiked) return closingBrowser();

    await doLike();
    closingBrowser();
  } catch (error: any) {
    console.log("[x] Kesalahan: ", error.message);
  }
};

if (!CREDS.EM || !CREDS.PW) {
  console.log("[x] Email dan password masih kosong");
} else {
  cron.schedule("*/30 * * * *", () => {
    console.log("[] Cron dieksekusi []");
    init().then(runCron).catch(console.error);
  });

  console.log("[] Buzztama berjalan setiap 30 menit []");
}
