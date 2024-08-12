const baseUrl =
  process.env.NODE_ENV === "production"
    ? `${process.env.BASE_URL}/emails`
    : "http://localhost:3000/emails";

const menuItemBaseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.BASE_URL
    : "http://localhost:3000";

const dynamicAssetUrls = {
  baseUrl,
  menuItemBaseUrl,
};

export default dynamicAssetUrls;
