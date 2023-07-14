# Buzztama

Automasi like dan share postingan FB STMIK Komputama.

# Konfigurasi

## Akun

Masukkan email dan password ke `src/index.ts` di baris `14` dan `15`.

PASTIKAN FB KALIAN DALAM MODE GELAP DAN BAHASA INGGRIS.

```js
const CREDS = {
  EM: "your_email_or_username",
  PW: "your_password",
};
```

Kamu dapat mencobanya dengan akun dummy.

## User Agent

Kunjungi (Dapatkan User Agent)[https://whatmyuseragent.com/] lalu copy dan ubah user agent pada baris ke `5`.

```js
const USER_AGENT = "Mozilla/5.0 .... ";
```

## Interval

Cron job berjalan setiap 30 menit sekali, jika ingin diubah terletak di baris `198` dengan notasi cron

```js
cron.schedule("*/30 * * * *", () => {
  console.log("[] Cron dieksekusi []");
  init().then(runCron).catch(console.error);
});
```

# Deployment

## Lokal

Untuk menjalankan secara lokal, pastikan sudah terdapat `Node.js` terinstal dengan versi diatas `16`.

1. Install `pnpm` dengan perintah `npm i -g pnpm`
2. Masuk ke folder lewat cmd dan ketikkan perintah `pnpm install`
3. Jalankan dengan perintah `pnpm dev` atau build terlebih dahulu dengan perintah `pnpm build` lalu `pnpm start`

## Online

Sudah terdapat Dockerfile tinggal hosting ke penyedia hosting yang support Docker dan nodejs seperti Railway, Zeabur, Render, Heroku, dll.
