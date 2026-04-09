import connectDB from "./mongodb";
import SiteSettings from "@/models/SiteSettings";

let cachedSettings: any = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

export async function getSiteSettings() {
  // Check cache
  if (cachedSettings && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedSettings;
  }

  try {
    await connectDB();
    let settings = await SiteSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await SiteSettings.create({
        siteTitle: "iSPORTS Cricket | UAE's Premium Cricket Store",
        siteDescription:
          "Shop professional cricket gear in Sharjah, Ajman, and across UAE.",
        siteKeywords: ["cricket", "sports", "UAE", "cricket equipment"],
        logo: "/ISportsCricket-Logo.png",
        favicon: "/favicon.ico", // ✅ Points to public/favicon.ico
        phone: "+971 52 6514 666",
        email: "info@isportscricket.com",
        address: "Sharjah, UAE",
        whatsappNumber: "+971526514666",
        updatedBy: "system",
      });
    }

    // ✅ Ensure favicon has correct path
    let faviconPath = settings.favicon || "/favicon.ico";
    if (faviconPath && !faviconPath.startsWith("/")) {
      faviconPath = "/" + faviconPath;
    }

    const keywordsArray = Array.isArray(settings.siteKeywords)
      ? [...settings.siteKeywords]
      : settings.siteKeywords
        ? [settings.siteKeywords]
        : ["cricket", "sports", "UAE"];

    const plainSettings = {
      siteTitle: String(
        settings.siteTitle || "iSPORTS Cricket | UAE's Premium Cricket Store",
      ),
      siteDescription: String(
        settings.siteDescription ||
          "Shop professional cricket gear in Sharjah, Ajman, and across UAE.",
      ),
      siteKeywords: keywordsArray,
      logo: String(settings.logo || "/ISportsCricket-Logo.png"),
      favicon: faviconPath, // ✅ Use the corrected path
      phone: String(settings.phone || "+971 52 6514 666"),
      email: String(settings.email || "info@isportscricket.com"),
      address: String(settings.address || "Sharjah, UAE"),
      whatsappNumber: String(settings.whatsappNumber || "+971526514666"),
      facebook: String(settings.facebook || ""),
      instagram: String(settings.instagram || ""),
      twitter: String(settings.twitter || ""),
      youtube: String(settings.youtube || ""),
      tiktok: String(settings.tiktok || ""),
      metaTitle: String(settings.metaTitle || ""),
      metaDescription: String(settings.metaDescription || ""),
      ogImage: String(settings.ogImage || ""),
      sessionTimeoutHours: Number(settings.sessionTimeoutHours) || 1,
      singleDeviceOnly: settings.singleDeviceOnly !== false,
    };

    cachedSettings = plainSettings;
    cacheTime = Date.now();

    return plainSettings;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return {
      siteTitle: "iSPORTS Cricket | UAE's Premium Cricket Store",
      siteDescription:
        "Shop professional cricket gear in Sharjah, Ajman, and across UAE.",
      siteKeywords: ["cricket", "sports", "UAE"],
      logo: "/ISportsCricket-Logo.png",
      favicon: "/favicon.ico",
      phone: "+971 52 6514 666",
      email: "info@isportscricket.com",
      address: "Sharjah, UAE",
      whatsappNumber: "+971526514666",
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      tiktok: "",
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
      sessionTimeoutHours: 1,
      singleDeviceOnly: true,
    };
  }
}
