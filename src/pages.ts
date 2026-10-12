/**
 * Public pages required by the Google OAuth consent screen:
 * application home page (/) and privacy policy (/privacy).
 * Bilingual: Ukrainian first, English below (Google reviewers read English).
 */

const CONTACT_EMAIL = "o.zhyliak@ridni.org.ua";
const ORG_NAME_UA = "Благодійний фонд «Рідні»";
const ORG_NAME_EN = "Ridni Charitable Foundation";
const LAST_UPDATED = "2026-10-12";

function layout(title: string, body: string): string {
	return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${title}</title>
  <style>
    :root{--bg:#f7f7f5;--card:#fff;--text:#1f2a24;--muted:#5b6660;--accent:#2f6f4f;--line:#e4e6e3}
    @media (prefers-color-scheme:dark){:root{--bg:#141816;--card:#1c211e;--text:#e8ece9;--muted:#a3ada7;--accent:#7cc39c;--line:#2c332f}}
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;padding:32px 16px}
    main{max-width:760px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:32px}
    h1{font-size:1.6rem;line-height:1.25;margin:0 0 8px}
    h2{font-size:1.15rem;margin:28px 0 8px}
    p,li{color:var(--text)} .muted{color:var(--muted);font-size:.9rem}
    a{color:var(--accent)} code{background:var(--bg);padding:2px 6px;border-radius:4px;font-size:.9em}
    hr{border:0;border-top:1px solid var(--line);margin:36px 0}
    nav{margin-bottom:24px;font-size:.95rem} nav a{margin-right:16px}
  </style>
</head>
<body><main>
<nav><a href="/">Головна / Home</a><a href="/privacy">Конфіденційність / Privacy</a></nav>
${body}
</main></body></html>`;
}

export function renderHomePage(origin: string): string {
	return layout(
		"Ridni MCP — GA4 + Search Console",
		`<h1>Ridni MCP: Google Analytics 4 + Search Console</h1>
<p class="muted">${ORG_NAME_UA}</p>
<p>Внутрішній сервіс фонду «Рідні», який дає AI-асистенту Claude доступ <strong>лише для читання</strong> до даних Google Analytics 4 і Google Search Console сайту фонду. Його використовують співробітники фонду для аналізу відвідуваності та пошукової видимості сайту.</p>
<ul>
  <li>Вхід — через Google-акаунт. Доступ мають лише авторизовані співробітники та партнери фонду.</li>
  <li>Кожен користувач бачить лише ті ресурси GA4 і Search Console, до яких уже має доступ у Google.</li>
  <li>Сервіс нічого не змінює в Google Analytics чи Search Console.</li>
</ul>
<p>Адреса для підключення в Claude: <code>${origin}/mcp</code></p>
<p>Як ми обробляємо дані — у <a href="/privacy">Політиці конфіденційності</a>.</p>
<hr />
<h1>Ridni MCP: Google Analytics 4 + Search Console</h1>
<p class="muted">${ORG_NAME_EN}</p>
<p>An internal service of the Ridni Foundation that gives the Claude AI assistant <strong>read-only</strong> access to the foundation's Google Analytics 4 and Google Search Console data. It is used by foundation staff to analyse website traffic and search visibility.</p>
<ul>
  <li>Sign-in is with a Google account. Only authorised foundation staff and partners can sign in.</li>
  <li>Each user only sees the GA4 and Search Console properties they already have access to in Google.</li>
  <li>The service never modifies anything in Google Analytics or Search Console.</li>
</ul>
<p>Connector URL for Claude: <code>${origin}/mcp</code></p>
<p>See the <a href="/privacy">Privacy Policy</a> for how data is handled.</p>
<p class="muted">Contact: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>`,
	);
}

export function renderPrivacyPage(): string {
	return layout(
		"Політика конфіденційності / Privacy Policy — Ridni MCP",
		`<h1>Політика конфіденційності Ridni MCP</h1>
<p class="muted">Оновлено: ${LAST_UPDATED} · ${ORG_NAME_UA}</p>

<h2>Які дані ми отримуємо</h2>
<ul>
  <li><strong>Дані профілю Google:</strong> адреса email, ім'я та ідентифікатор акаунта — лише щоб перевірити, чи має користувач доступ до сервісу.</li>
  <li><strong>Google Analytics</strong> (доступ <code>analytics.readonly</code>) і <strong>Google Search Console</strong> (доступ <code>webmasters.readonly</code>) — лише для читання звітів, які користувач запитує через Claude.</li>
</ul>

<h2>Як ми використовуємо дані</h2>
<p>Дані Google використовуються виключно для того, щоб повернути користувачу запитані ним звіти в Claude. Ми не продаємо, не передаємо третім особам, не використовуємо для реклами і не використовуємо для навчання моделей штучного інтелекту.</p>

<h2>Зберігання</h2>
<p>Сервіс не зберігає вміст звітів. Зберігаються лише токени доступу Google (у зашифрованому вигляді) та email користувача — в інфраструктурі Cloudflare Workers, поки користувач не відкличе доступ. Токен підключення до сервісу діє до 30 днів.</p>

<h2>Як відкликати доступ</h2>
<p>У будь-який момент: <a href="https://myaccount.google.com/permissions" rel="noopener">myaccount.google.com/permissions</a> → Ridni MCP → «Видалити доступ». Також можна відключити конектор у налаштуваннях Claude. Щоб видалити збережені токени, напишіть нам.</p>

<h2>Контакт</h2>
<p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>

<hr />

<h1>Ridni MCP Privacy Policy</h1>
<p class="muted">Last updated: ${LAST_UPDATED} · ${ORG_NAME_EN}</p>

<h2>Data we access</h2>
<ul>
  <li><strong>Google profile data:</strong> email address, name and account ID — only to check whether the user is authorised to use the service.</li>
  <li><strong>Google Analytics</strong> (<code>analytics.readonly</code> scope) and <strong>Google Search Console</strong> (<code>webmasters.readonly</code> scope) — read-only, to return the reports the user requests through Claude.</li>
</ul>

<h2>How we use data</h2>
<p>Google user data is used solely to return the reports the user requests in Claude. We do not sell it, share it with third parties, use it for advertising, or use it to train AI models.</p>
<p>Ridni MCP's use and transfer of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" rel="noopener">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>

<h2>Storage and retention</h2>
<p>Report contents are not stored. Only Google access tokens (encrypted) and the user's email are stored, on Cloudflare Workers infrastructure, until the user revokes access. The connection token to this service is valid for up to 30 days.</p>

<h2>Revoking access</h2>
<p>At any time: <a href="https://myaccount.google.com/permissions" rel="noopener">myaccount.google.com/permissions</a> → Ridni MCP → Remove access. You can also disconnect the connector in Claude settings. To have stored tokens deleted, contact us.</p>

<h2>Contact</h2>
<p><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>`,
	);
}
