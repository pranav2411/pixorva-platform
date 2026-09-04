import { NextRequest, NextResponse } from "next/server";

// Base industry benchmarks
const INDUSTRY_BASE_COUNTS: Record<string, number> = {
  Accounting: 4820,
  Advertising: 8940,
  Agriculture: 2150,
  AI: 14280,
  Analytics: 3760,
  "App Development": 6420,
  Architecture: 1890,
  "Asset Management": 3120,
  Automotive: 5840,
  Bakery: 4320,
  Banking: 1350,
  Bar: 9100,
  "Beauty Salon": 12150,
  "Big Data": 2680,
  "Billing Services": 1820,
  Biotechnology: 1640,
  Blockchain: 2380,
  Bookkeeping: 3540,
  Brewing: 2510,
  "Building Maintenance": 5120,
  "Business Consulting": 9840,
  Catering: 3950,
  "Child Care": 5280,
  "Cleaning Services": 8420,
  "Cloud Computing": 5760,
  "Coffee Shop": 17300,
  "Commercial Real Estate": 4180,
  "Computer Repair": 2960,
  "Graphic Design": 8720,
  "Fitness & Gym": 7890,
  Healthcare: 13450,
  "Legal Services": 5820,
  Logistics: 7340,
  Hospitality: 10420,
  "E-Commerce": 28650,
  Education: 9140,
  "Real Estate": 15600,
  Cybersecurity: 3480,
};

function isSafeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }
    const parts = hostname.split('.').map(Number);
    if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      if (parts[0] === 10) return false;
      if (parts[0] === 127) return false;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
      if (parts[0] === 192 && parts[1] === 168) return false;
      if (parts[0] === 169 && parts[1] === 254) return false;
      if (parts[0] === 0) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { website, industry } = await req.json();

    const cleanIndustry = industry?.trim() || "Accounting";
    const baseCount = INDUSTRY_BASE_COUNTS[cleanIndustry] || 3200;

    // Generate a deterministic variation based on the industry and website string
    const seedString = `${cleanIndustry}-${website || "direct"}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash |= 0;
    }
    const variation = Math.abs(hash % 380) - 190;
    const finalCompaniesCount = Math.max(120, baseCount + variation);

    let websiteScanned = false;
    let siteTitle = "";
    let latencyMs = 0;

    // Real fetch inspection if website URL is provided
    if (website && typeof website === "string" && website.trim().length > 3) {
      let targetUrl = website.trim();
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = "https://" + targetUrl;
      }

      if (isSafeUrl(targetUrl)) {
        try {
          const startTime = Date.now();
          const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(targetUrl, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": "Pixorva-Analyzer/1.0 (+https://pixorva.com)",
          },
        });
        clearTimeout(timeoutId);

        latencyMs = Date.now() - startTime;
        if (res.ok) {
          websiteScanned = true;
          const html = await res.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            siteTitle = titleMatch[1].trim().slice(0, 50);
          }
        }
      } catch {
        // Fallback gracefully if domain timed out or blocked scrapers
        websiteScanned = false;
      }
      }
    }

    return NextResponse.json({
      success: true,
      industry: cleanIndustry,
      companiesFound: finalCompaniesCount,
      websiteScanned,
      siteTitle,
      latencyMs,
      timeOptimizationPercent: 78,
      hoursSavedPerWeek: 28,
      growthAreas: [
        "Inbound lead qualification speed (< 2 mins)",
        "Automated inbox triage & client drafting",
        "Continuous organic Google traffic expansion",
      ],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to analyze" },
      { status: 500 }
    );
  }
}
