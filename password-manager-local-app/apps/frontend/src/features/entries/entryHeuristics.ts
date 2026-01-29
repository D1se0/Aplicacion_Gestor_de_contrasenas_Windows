import type { Category } from "../../types";

export function guessCategory(title: string, url?: string | null): Category {
    const t = `${title} ${url ?? ""}`.toLowerCase();

    const has = (arr: string[]) => arr.some((k) => t.includes(k));

    if (has(["netflix", "spotify", "steam", "disney", "hbo", "prime video", "twitch", "youtube"])) return "Entertainment";
    if (has(["amazon", "ebay", "shop", "store", "checkout", "nike", "zara", "aliexpress", "mercado", "ikea"])) return "Shopping";
    if (has(["jira", "confluence", "slack", "teams", "github", "gitlab", "aws", "gcp", "azure", "vpn", "work", "company"])) return "Work";
    if (has(["bank", "banco", "paypal", "wise", "revolut", "stripe", "crypto", "wallet", "card", "finanzas"])) return "Finance";
    if (has(["facebook", "instagram", "x.com", "twitter", "tiktok", "snapchat", "discord", "linkedin"])) return "Social Media";
    return "Other";
}
