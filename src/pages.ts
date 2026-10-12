/**
 * Public pages required by the Google OAuth consent screen:
 * application home page (/) and privacy policy (/privacy).
 *
 * These pages must be reachable by Google reviewers but must never be indexed,
 * archived, cached, snippeted or translated by any crawler. Indexing directives
 * are sent three ways: the X-Robots-Tag header (applied to every response in
 * index.ts), <meta name="robots"> plus crawler-specific meta tags here, and
 * Cache-Control: no-store. robots.txt deliberately allows crawling: a crawler
 * blocked by robots.txt never sees the noindex directive and may still index
 * the bare URL from external links.
 */

const CONTACT_EMAIL = "o.zhyliak@ridni.org.ua";
const ORG_NAME = "Ridni Charitable Foundation";
/** Must match the app name on the Google OAuth consent screen (Branding). */
const SERVICE_NAME = "Ridni GA4+GSC MCP";
const LAST_UPDATED = "2026-10-12";

/** Strictest set of indexing directives understood by major crawlers. */
export const ROBOTS_DIRECTIVES =
	"noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, nocache, max-snippet:0, max-image-preview:none, max-video-preview:0, unavailable_after: 1 Jan 2000 00:00:00 GMT";

/** Headers for the public HTML pages. */
export const PAGE_HEADERS: Record<string, string> = {
	"Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
	"Referrer-Policy": "no-referrer",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
	"Content-Security-Policy":
		"default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

/** robots.txt: allow crawling so that noindex is actually seen; opt out of AI training/snippets. */
export const ROBOTS_TXT = `# This service is private. All pages send:
#   X-Robots-Tag: ${ROBOTS_DIRECTIVES}
# Crawling is allowed on purpose so crawlers can see and obey the noindex directive.
User-agent: *
Allow: /
Disallow: /mcp
Disallow: /sse
Disallow: /authorize
Disallow: /callback
Disallow: /token
Disallow: /register
Content-Signal: search=no, ai-input=no, ai-train=no
`;

function layout(title: string, body: string): string {
	return `<!DOCTYPE html>
<html lang="en" translate="no">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="${ROBOTS_DIRECTIVES}" />
  <meta name="googlebot" content="${ROBOTS_DIRECTIVES}" />
  <meta name="googlebot-news" content="noindex, nosnippet" />
  <meta name="bingbot" content="${ROBOTS_DIRECTIVES}" />
  <meta name="google" content="notranslate" />
  <meta name="referrer" content="no-referrer" />
  <meta name="format-detection" content="telephone=no, email=no, address=no" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <title>${title}</title>
  <style>
    /* Ridni brand (ridni.org.ua): primary #603790 (also links), accent #FFB627, text #3C3343 */
    :root{--bg:#F9F4FF;--card:#FFFFFF;--text:#3C3343;--muted:#696969;--primary:#603790;--primary-dark:#431C72;--accent:#FFB627;--link:#603790;--line:#E5D7F6;--soft:#EFE7F8}
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--text);font:17px/1.65 "Taktika Sans",system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans",sans-serif;font-weight:400;padding:32px 16px}
    main{max-width:760px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:9px;padding:32px;border-top:4px solid var(--primary)}
    h1{font-size:1.75rem;line-height:1.25;margin:0 0 8px;font-weight:700;color:var(--primary-dark)}
    h2{font-size:1.15rem;margin:28px 0 8px;font-weight:600;color:var(--primary)}
    .muted{color:var(--muted);font-size:.9rem}
    a{color:var(--link);font-weight:500;text-decoration-thickness:1px;text-underline-offset:2px}
    a:hover{color:var(--primary-dark)}
    code{background:var(--soft);color:var(--primary-dark);padding:2px 8px;border-radius:6px;font-size:.9em;word-break:break-all}
    ul{padding-left:1.2em} li::marker{color:var(--accent)}
    nav{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px}
    nav a{display:inline-block;padding:6px 16px;border-radius:33px;background:var(--soft);color:var(--primary);text-decoration:none;font-size:.9rem}
    nav a:hover{background:var(--primary);color:#fff}
    .brand{display:flex;align-items:center;gap:12px;margin-bottom:20px;font-weight:600;color:var(--primary-dark)}
    .brand img{width:48px;height:48px}
  </style>
</head>
<body><main>
<div class="brand"><img src="/logo.png" alt="Ridni Charitable Foundation logo" width="48" height="48" /><span>${SERVICE_NAME}</span></div>
<nav><a href="/" rel="nofollow">Home</a><a href="/privacy" rel="nofollow">Privacy Policy</a><a href="/terms" rel="nofollow">Terms of Service</a></nav>
${body}
</main></body></html>`;
}

const ext = (href: string, text: string) =>
	`<a href="${href}" rel="nofollow noopener noreferrer" target="_blank">${text}</a>`;

export function renderHomePage(origin: string): string {
	return layout(
		`${SERVICE_NAME}`,
		`<h1>${SERVICE_NAME}</h1>
<p>Google Analytics 4 + Google Search Console connector for Claude</p>
<p class="muted">${ORG_NAME}</p>
<p>${SERVICE_NAME} is an internal service of the ${ORG_NAME}. It gives the Claude AI assistant <strong>read-only</strong> access to the foundation's Google Analytics 4 and Google Search Console data, so foundation staff can analyse website traffic and search visibility.</p>
<ul>
  <li>Sign-in is with a Google account. Only authorised foundation staff and partners can sign in.</li>
  <li>Each user only sees the Google Analytics and Search Console properties they already have access to in Google.</li>
  <li>The service never creates, modifies or deletes anything in Google Analytics or Search Console.</li>
</ul>
<p>Connector URL for Claude: <code>${origin}/mcp</code></p>
<p>See the <a href="/privacy" rel="nofollow">Privacy Policy</a> and <a href="/terms" rel="nofollow">Terms of Service</a>.</p>
<p class="muted">Contact: <a href="mailto:${CONTACT_EMAIL}" rel="nofollow">${CONTACT_EMAIL}</a></p>`,
	);
}

export function renderPrivacyPage(): string {
	return layout(
		`${SERVICE_NAME} Privacy Policy`,
		`<h1>${SERVICE_NAME} Privacy Policy</h1>
<p class="muted">Last updated: ${LAST_UPDATED} · ${ORG_NAME}</p>

<h2>Who we are</h2>
<p>${SERVICE_NAME} is operated by the ${ORG_NAME} (Ukraine) for internal use by its staff and authorised partners.</p>

<h2>Data we access</h2>
<ul>
  <li><strong>Basic Google profile data</strong> (email address, name, account ID), used only to check whether the user is authorised to use the service.</li>
  <li><strong>Google Analytics data</strong> (<code>https://www.googleapis.com/auth/analytics.readonly</code>), read-only, to return analytics reports the user requests through Claude.</li>
  <li><strong>Google Search Console data</strong> (<code>https://www.googleapis.com/auth/webmasters.readonly</code>), read-only, to return search performance, sitemap and URL inspection reports the user requests through Claude.</li>
</ul>

<h2>How we use data</h2>
<p>Google user data is used solely to provide the reports the user explicitly requests. We do not sell Google user data, share it with third parties, use it for advertising, or use it to develop, improve or train artificial intelligence or machine learning models.</p>
<p>${SERVICE_NAME}'s use and transfer of information received from Google APIs adheres to the ${ext("https://developers.google.com/terms/api-services-user-data-policy", "Google API Services User Data Policy")}, including the Limited Use requirements.</p>

<h2>Storage and retention</h2>
<p>Report contents are not stored by the service. The only data stored are the user's Google OAuth tokens (encrypted) and email address, kept on Cloudflare Workers infrastructure for as long as the user keeps the connection active. Connection tokens issued by the service expire after at most 30 days.</p>

<h2>Revoking access and deletion</h2>
<p>You can revoke access at any time at ${ext("https://myaccount.google.com/permissions", "myaccount.google.com/permissions")} (select ${SERVICE_NAME}, then remove access), or by disconnecting the connector in Claude. To request deletion of any stored tokens, email us at the address below; we will delete them within 30 days.</p>

<h2>Security</h2>
<p>All traffic is encrypted with TLS. Access is restricted to an allowlist of authorised accounts, and the service requests read-only scopes only.</p>

<h2>Changes</h2>
<p>We may update this policy; the date at the top shows the latest revision.</p>

<h2>Contact</h2>
<p><a href="mailto:${CONTACT_EMAIL}" rel="nofollow">${CONTACT_EMAIL}</a></p>`,
	);
}

export function renderTermsPage(): string {
	return layout(
		`${SERVICE_NAME} Terms of Service`,
		`<h1>${SERVICE_NAME} Terms of Service</h1>
<p class="muted">Last updated: ${LAST_UPDATED} · ${ORG_NAME}</p>

<h2>1. The service</h2>
<p>${SERVICE_NAME} is an internal tool operated by the ${ORG_NAME} that lets the Claude AI assistant read Google Analytics 4 and Google Search Console data on behalf of a signed-in user. It is provided free of charge to foundation staff and authorised partners only.</p>

<h2>2. Eligibility and accounts</h2>
<p>Only users whose Google account has been authorised by the foundation may use the service. You must sign in with your own Google account and must not share your access with anyone else. We may grant, restrict or revoke access at any time.</p>

<h2>3. Acceptable use</h2>
<ul>
  <li>Use the service only for the foundation's legitimate work.</li>
  <li>Do not attempt to access data you are not authorised to see, bypass access controls, or disrupt the service.</li>
  <li>Comply with the ${ext("https://developers.google.com/terms", "Google APIs Terms of Service")} and the terms of the Claude product you connect from.</li>
</ul>

<h2>4. Data</h2>
<p>The service only reads data you already have access to in Google, using read-only permissions. How data is handled is described in the <a href="/privacy" rel="nofollow">Privacy Policy</a>, which forms part of these terms.</p>

<h2>5. AI-generated output</h2>
<p>Analyses and summaries produced by Claude from the retrieved data may be incomplete or inaccurate. Verify important figures in Google Analytics or Search Console before relying on them.</p>

<h2>6. Availability and warranty</h2>
<p>The service is provided "as is" and "as available", without warranties of any kind. It may be changed, suspended or discontinued at any time without notice.</p>

<h2>7. Limitation of liability</h2>
<p>To the maximum extent permitted by law, the ${ORG_NAME} is not liable for any indirect, incidental or consequential damages, or for any loss of data or profits, arising from the use of the service.</p>

<h2>8. Termination</h2>
<p>You may stop using the service at any time by disconnecting it in Claude and revoking access at ${ext("https://myaccount.google.com/permissions", "myaccount.google.com/permissions")}. We may suspend or terminate your access if you breach these terms.</p>

<h2>9. Governing law</h2>
<p>These terms are governed by the laws of Ukraine.</p>

<h2>10. Changes and contact</h2>
<p>We may update these terms; the date at the top shows the latest revision. Questions: <a href="mailto:${CONTACT_EMAIL}" rel="nofollow">${CONTACT_EMAIL}</a></p>`,
	);
}
