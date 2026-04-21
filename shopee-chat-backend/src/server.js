import app from "./app.js";

const port = Number(process.env.PORT || 3010);
const baseUrl = String(process.env.APP_BASE_URL || `http://localhost:${port}`).replace(/\/$/, "");
const redirectPath = process.env.SHOPEE_REDIRECT_PATH || "/api/shopee/oauth/callback";
const redirectUrl = `${baseUrl}${redirectPath}`;

app.listen(port, () => {
  console.log(`Shopee chat backend running on ${baseUrl}`);
  console.log(`OAuth redirect: ${redirectUrl}`);
});
