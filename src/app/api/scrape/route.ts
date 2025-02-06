import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

interface PropertyInfo {
  url: string;
  site: string;
  name: string;
  rent: string;
  maintenanceFee: string;
  address: string;
  addressLink: string;
  thumbnails: string[];
  comment?: string;
}

/**
 * GET /api/scrape
 *
 * @param request - Request object
 * @returns Response object
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
    }

    const response = await axios.get(url, {
      maxRedirects: 0,
      validateStatus: function (status) {
        return status === 200;
      },
    });
    const html = cheerio.load(response.data);
    const data: PropertyInfo | null = extractPropertyInfo(url, html);

    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch the URL" }, { status: 500 });
  }
}

/**
 * Extract property information from the HTML
 *
 * @param url - URL of the property listing
 * @param $ - Cheerio instance
 * @returns PropertyInfo
 */
const extractPropertyInfo = (url: string, $: cheerio.CheerioAPI): PropertyInfo | null => {
  const info: PropertyInfo | null = {
    url: url,
    site: "",
    name: "",
    rent: "",
    maintenanceFee: "",
    address: "",
    addressLink: "",
    thumbnails: [],
  };

  // Determine the site based on the URL
  const domain = new URL(url).hostname;
  if (domain.includes("suumo.jp")) {
    info.site = "suumo";
  } else if (domain.includes("homes.co.jp")) {
    info.site = "homes";
  } else if (domain.includes("athome.co.jp")) {
    info.site = "athome";
  } else if (domain.includes("chintai-ex.jp")) {
    info.site = "chintaiEx";
  } else {
    info.site = "unknown";
    return info;
  }

  // Extract property information based on the site
  switch (info.site) {
    case "suumo":
      info.name = $(".section_h1-header-title").text().trim().split("-")[0].trim();
      info.rent =
        $(".property_view_main-emphasis").text().trim() ||
        $(".property_view_note-emphasis").text().trim();
      info.maintenanceFee =
        $(".property_data--main .property_data-body").text().trim() ||
        $(".property_view_note-emphasis")
          .next()
          .text()
          .trim()
          .split(/\u00A0/)[1]
          ?.trim();
      info.address =
        $(".property_view_detail--location .property_view_detail-text").text().trim() ||
        $(".property_view_table-body").first().text().trim();
      info.thumbnails = $(".property_view_gallery-thumbnail-list img")
        .map((_, el) => $(el).attr("data-src"))
        .get();
      break;

    case "homes":
      info.name = $(".detail-main-screen:text-base").eq(0).text().trim().split("-")[0].trim();
      info.rent = $('dt:contains("賃料")').next("dd").text();
      info.maintenanceFee = $('dt:contains("管理費等")').next("dd").text();
      info.address = $('dt:contains("所在地")').next("dd").text();
      info.thumbnails = $('[role="tablist"]')
        .first()
        .find("img")
        .map((_, el) => $(el).attr("src"))
        .get();
      break;

    case "athome":
      break;

    case "chintaiEx":
      break;
  }

  info.addressLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`;
  return info;
};
