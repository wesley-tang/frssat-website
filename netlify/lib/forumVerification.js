import axios from "axios";
import * as cheerio from "cheerio";

const MAX_CONTENT_LENGTH = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 7000;
const SCAN_BUDGET_MS = 8000;
const MAX_PAGES = 50;

function isAllowedForumHost(hostname) {
    const host = String(hostname || "").toLowerCase();
    return host === "flightrising.com" || host.endsWith(".flightrising.com");
}

export function validateForumUrl(rawUrl) {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new Error("Invalid forum URL.");
    }

    if (parsed.protocol !== "https:") {
        throw new Error("Forum URL must use https.");
    }

    if (!isAllowedForumHost(parsed.hostname)) {
        throw new Error("Forum URL must be on flightrising.com.");
    }

    if (parsed.username || parsed.password) {
        throw new Error("Forum URL must not contain credentials.");
    }

    return parsed;
}

async function fetchPage(url, timeoutMs) {
    let currentUrl = validateForumUrl(url);
    const maxRedirects = 3;

    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
        const response = await axios.get(currentUrl.toString(), {
            timeout: Math.max(1000, timeoutMs),
            maxContentLength: MAX_CONTENT_LENGTH,
            maxRedirects: 0,
            headers: {
                "User-Agent": "FRSSAT signup verifier"
            },
            validateStatus: status => status < 500
        });

        if (response.status >= 300 && response.status < 400) {
            const location = response.headers?.location;
            if (!location) {
                throw new Error("Forum URL redirected without a location header.");
            }

            // Validate each redirect target before fetching it.
            currentUrl = validateForumUrl(new URL(location, currentUrl).toString());
            continue;
        }

        const html = String(response.data ?? "");
        if (
            response.headers?.["cf-mitigated"] === "challenge" ||
            html.includes("Just a moment...") ||
            html.includes("challenges.cloudflare.com")
        ) {
            throw new Error(
                "Flight Rising returned a Cloudflare challenge instead of the forum page. " +
                "Server-side scraping is blocked for this request; paste the specific post URL or verify manually."
            );
        }

        if (response.status >= 400) {
            throw new Error(`Forum returned HTTP ${response.status}.`);
        }

        return {
            html,
            finalUrl: currentUrl.toString()
        };
    }

    throw new Error("Too many redirects while fetching the forum URL.");
}

function extractPost($, pageUrl, uuid) {
    let foundPost = null;
    const parsedPageUrl = new URL(pageUrl);
    const hash = parsedPageUrl.hash.replace(/^#/, "");

    // Strategy A: if the supplied URL links directly to a post, inspect that post first.
    if (hash && /^(post_)?\d+$/.test(hash)) {
        const specificPost = $(`#${hash}`);
        if (specificPost.length > 0) {
            const postContent = specificPost.find(".post-text-content").text();
            if (postContent.includes(uuid)) {
                foundPost = specificPost;
            }
        }
    }

    // Strategy B: scan every post on the page.
    if (!foundPost) {
        $("div.post").each((i, el) => {
            const post = $(el);
            if (post.find(".post-text-content").text().includes(uuid)) {
                foundPost = post;
                return false;
            }
        });
    }

    if (!foundPost) {
        return { found: false };
    }

    const authorLink = foundPost.find("a.post-author-username").first();
    const username = authorLink.text().trim();
    const authorHref = authorLink.attr("href");
    const idMatch = authorHref ? authorHref.match(/\/clan-profile\/(\d+)/) : null;
    const userId = idMatch ? idMatch[1] : null;
    const postId = foundPost.attr("id") || (hash || null);

    let postUrl = pageUrl;
    if (postId) {
        const urlObj = new URL(pageUrl);
        urlObj.hash = `#${postId}`;
        postUrl = urlObj.toString();
    }

    return {
        found: true,
        username,
        userId,
        postId,
        postUrl
    };
}

function getPageNumber(urlObj) {
    const queryPage = urlObj.searchParams.get("page");
    if (queryPage && /^\d+$/.test(queryPage)) {
        return parseInt(queryPage, 10);
    }

    // Flight Rising thread URLs contain a numeric topic ID, e.g.
    // /forums/cc/12345. A trailing page number looks like
    // /forums/cc/12345/2, so require a numeric segment before it.
    const segments = urlObj.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    const previous = segments[segments.length - 2];

    if (last && previous && /^\d+$/.test(last) && /^\d+$/.test(previous)) {
        return parseInt(last, 10);
    }

    return null;
}

function collectPageUrls($, currentPageUrl) {
    const current = new URL(currentPageUrl);
    const pages = new Map();
    const currentPath = current.pathname.replace(/\/$/, "");

    const addUrl = (href) => {
        if (!href) return;

        try {
            const candidate = new URL(href, current);
            if (candidate.protocol !== "https:") return;
            if (!isAllowedForumHost(candidate.hostname)) return;

            // Skip direct post links; those are handled by the post scanner.
            if (candidate.hash) return;

            const candidatePath = candidate.pathname.replace(/\/$/, "");
            const candidatePage = getPageNumber(candidate);
            const currentPage = getPageNumber(current);
            const hasQueryPage = candidate.searchParams.has("page");
            const numericSuffix = /\/\d+\/?$/.test(candidate.pathname);

            const stripPageNumber = (path) => path.replace(/\/\d+\/?$/, "");
            const sameNumericPageBase =
                currentPage !== null &&
                candidatePage !== null &&
                stripPageNumber(candidatePath) === stripPageNumber(currentPath);

            const relatedPath =
                candidatePath === currentPath ||
                candidatePath.startsWith(`${currentPath}/`) ||
                currentPath.startsWith(`${candidatePath}/`) ||
                sameNumericPageBase;

            if (!hasQueryPage && !(numericSuffix && relatedPath)) return;

            if (candidatePage === null && !hasQueryPage) return;

            pages.set(candidate.toString(), candidate);
        } catch {
            // Ignore malformed links.
        }
    };

    // Prefer explicit pagination containers when the forum provides them.
    $(".pagination a[href], .pagination__link[href], a[href*='page=']").each((i, el) => {
        addUrl($(el).attr("href"));
    });

    if (pages.size === 0) {
        $("a[href]").each((i, el) => {
            addUrl($(el).attr("href"));
        });
    }

    // If the pagination exposes the last page, generate every page in between.
    let maxPage = 1;
    for (const pageUrl of pages.values()) {
        const pageNumber = getPageNumber(pageUrl);
        if (pageNumber !== null) {
            maxPage = Math.max(maxPage, pageNumber);
        }
    }

    if (maxPage > 1) {
        const templateEntry = Array.from(pages.values()).find(u => getPageNumber(u) === maxPage) || current;

        for (let pageNumber = 1; pageNumber <= Math.min(maxPage, MAX_PAGES); pageNumber++) {
            const generated = new URL(templateEntry.toString());

            if (generated.searchParams.has("page")) {
                generated.searchParams.set("page", String(pageNumber));
            } else {
                generated.pathname = generated.pathname.replace(/\/(\d+)\/?$/, `/${pageNumber}`);
            }

            pages.set(generated.toString(), generated);
        }
    }

    pages.delete(current.toString());

    return Array.from(pages.values())
        .sort((a, b) => {
            const aPage = getPageNumber(a);
            const bPage = getPageNumber(b);
            if (aPage === null && bPage === null) return 0;
            if (aPage === null) return 1;
            if (bPage === null) return -1;
            return aPage - bPage;
        })
        .map(u => u.toString());
}

// Exported for tests and local fixtures.
export function extractForumPostFromHtml(html, pageUrl, uuid) {
    const $ = cheerio.load(html);
    return extractPost($, pageUrl, uuid);
}

// Exported for tests and local fixtures.
export function discoverForumPageUrls(html, pageUrl) {
    const $ = cheerio.load(html);
    return collectPageUrls($, pageUrl);
}

/**
 * Fetches the supplied forum URL and follows pagination until the UUID is found
 * or the scan budget/page cap is reached.
 */
export async function scanForumForUuid(rawUrl, uuid, options = {}) {
    const startedAt = Date.now();
    const maxPages = Math.min(options.maxPages || MAX_PAGES, MAX_PAGES);
    const startUrl = validateForumUrl(rawUrl).toString();

    const queue = [startUrl];
    const visited = new Set();
    const pagesScanned = [];
    let truncated = false;

    while (queue.length > 0 && pagesScanned.length < maxPages) {
        const remainingBudget = SCAN_BUDGET_MS - (Date.now() - startedAt);
        if (remainingBudget <= 0) {
            truncated = true;
            break;
        }

        const pageUrl = queue.shift();
        if (!pageUrl || visited.has(pageUrl)) continue;
        visited.add(pageUrl);

        let page;
        try {
            page = await fetchPage(pageUrl, Math.min(REQUEST_TIMEOUT_MS, remainingBudget));
        } catch (error) {
            if (pagesScanned.length === 0) {
                throw new Error(`Could not fetch the supplied signup URL: ${error.message}`);
            }
            continue;
        }

        pagesScanned.push(page.finalUrl);

        const $ = cheerio.load(page.html);
        const result = extractPost($, page.finalUrl, uuid);

        if (result.found) {
            return {
                ...result,
                pagesScanned,
                truncated: false
            };
        }

        if (queue.length === 0) {
            const pageUrls = collectPageUrls($, page.finalUrl);
            pageUrls.forEach(url => {
                if (!visited.has(url)) {
                    queue.push(url);
                }
            });

            if (queue.length + pagesScanned.length > maxPages) {
                truncated = true;
            }
        }
    }

    if (pagesScanned.length >= maxPages) {
        truncated = true;
    }

    return {
        found: false,
        pagesScanned,
        truncated
    };
}
