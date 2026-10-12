import type { AuthRequest, OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { type Context, Hono } from "hono";
import { PAGE_HEADERS, ROBOTS_TXT, renderHomePage, renderPrivacyPage, renderTermsPage } from "./pages";
import { fetchUpstreamAuthToken, getUpstreamAuthorizeUrl, type Props } from "./utils";
import {
	clientIdAlreadyApproved,
	parseRedirectApproval,
	renderApprovalDialog,
} from "./workers-oauth-utils";

const app = new Hono<{ Bindings: Env & { OAUTH_PROVIDER: OAuthHelpers } }>();

/* -------------------------------------------------------------------------- */
/* Allowlist helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Returns true if the email matches at least one entry of ALLOWED_EMAILS or
 * ALLOWED_DOMAINS. Both lists are comma-separated and case-insensitive.
 *
 * If neither secret is set, no one is allowed. This is on purpose: a public
 * worker with no allowlist would let any Google account burn the deployment.
 */
function isEmailAllowed(email: string, env: Env): boolean {
	const normalized = email.trim().toLowerCase();

	const allowedEmails = (env.ALLOWED_EMAILS || "")
		.split(",")
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);

	if (allowedEmails.includes(normalized)) return true;

	const allowedDomains = (env.ALLOWED_DOMAINS || "")
		.split(",")
		.map((d) => d.trim().toLowerCase().replace(/^@/, ""))
		.filter(Boolean);

	return allowedDomains.some((d) => normalized.endsWith(`@${d}`));
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function renderDeniedPage(email: string): string {
	return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Доступ заборонено</title>
  <style>
    body{font-family:system-ui,-apple-system,sans-serif;background:#f5f5f5;
      color:#26372b;display:flex;align-items:center;justify-content:center;
      min-height:100vh;margin:0;padding:1rem}
    .card{background:#fff;padding:2rem 2.5rem;border-radius:12px;
      box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:480px;text-align:center}
    h1{color:#ec662a;margin:0 0 1rem;font-size:1.5rem}
    p{line-height:1.6;color:#26372b}
    code{background:#f5f5f5;padding:.15rem .4rem;border-radius:4px;
      font-size:.9em;color:#26372b}
  </style>
</head>
<body>
  <div class="card">
    <h1>Доступ заборонено</h1>
    <p>Акаунт <code>${escapeHtml(email)}</code> не має доступу до цього MCP-сервера Рідних.</p>
    <p>Якщо це помилка — напишіть адміністратору.</p>
  </div>
</body>
</html>`;
}

/* -------------------------------------------------------------------------- */
/* OAuth flow                                                                 */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Public pages (Google OAuth consent screen: home page + privacy policy)     */
/* -------------------------------------------------------------------------- */

app.get("/", (c) => c.html(renderHomePage(new URL(c.req.url).origin), 200, PAGE_HEADERS));
app.get("/privacy", (c) => c.html(renderPrivacyPage(), 200, PAGE_HEADERS));
app.get("/terms", (c) => c.html(renderTermsPage(), 200, PAGE_HEADERS));
app.get("/robots.txt", (c) => c.text(ROBOTS_TXT, 200, { "Cache-Control": "public, max-age=3600" }));

app.get("/authorize", async (c) => {
	const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);
	const { clientId } = oauthReqInfo;
	if (!clientId) {
		return c.text("Invalid request", 400);
	}

	if (
		await clientIdAlreadyApproved(c.req.raw, oauthReqInfo.clientId, c.env.COOKIE_ENCRYPTION_KEY)
	) {
		return redirectToGoogle(c, oauthReqInfo);
	}

	return renderApprovalDialog(c.req.raw, {
		client: await c.env.OAUTH_PROVIDER.lookupClient(clientId),
		server: {
			description:
				"MCP server for Google Analytics 4 and Search Console. Requires read-only access to the GA4 and GSC properties of your account.",
			name: "Ridni MCP (GA4 + Search Console)",
		},
		state: { oauthReqInfo },
	});
});

app.post("/authorize", async (c) => {
	const { state, headers } = await parseRedirectApproval(c.req.raw, c.env.COOKIE_ENCRYPTION_KEY);
	if (!state.oauthReqInfo) {
		return c.text("Invalid request", 400);
	}

	return redirectToGoogle(c, state.oauthReqInfo, headers);
});

async function redirectToGoogle(
	c: Context,
	oauthReqInfo: AuthRequest,
	headers: Record<string, string> = {},
) {
	return new Response(null, {
		headers: {
			...headers,
			location: getUpstreamAuthorizeUrl({
				clientId: c.env.GOOGLE_CLIENT_ID,
				hostedDomain: c.env.HOSTED_DOMAIN,
				redirectUri: new URL("/callback", c.req.raw.url).href,
				scope:
					"openid email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly",
				state: btoa(JSON.stringify(oauthReqInfo)),
				upstreamUrl: "https://accounts.google.com/o/oauth2/v2/auth",
			}),
		},
		status: 302,
	});
}

/**
 * OAuth Callback Endpoint
 *
 * Google redirects here after user authentication.
 * 1. Exchange the temporary code for tokens.
 * 2. Fetch the user's email from Google.
 * 3. Check the email against ALLOWED_EMAILS / ALLOWED_DOMAINS.
 * 4. If allowed, complete the MCP OAuth flow back to the MCP client.
 */
app.get("/callback", async (c) => {
	// Get the oauthReqInfo out of state
	let oauthReqInfo: AuthRequest;
	try {
		oauthReqInfo = JSON.parse(atob(c.req.query("state") || "")) as AuthRequest;
	} catch {
		return c.text("Invalid state", 400);
	}
	if (!oauthReqInfo?.clientId) {
		return c.text("Invalid state", 400);
	}

	// Exchange the code for an access token
	const code = c.req.query("code");
	if (!code) {
		return c.text("Missing code", 400);
	}

	const [tokenResp, googleErrResponse] = await fetchUpstreamAuthToken({
		clientId: c.env.GOOGLE_CLIENT_ID,
		clientSecret: c.env.GOOGLE_CLIENT_SECRET,
		code,
		grantType: "authorization_code",
		redirectUri: new URL("/callback", c.req.url).href,
		upstreamUrl: "https://oauth2.googleapis.com/token",
	});
	if (googleErrResponse) {
		return googleErrResponse;
	}

	const { access_token, refresh_token, expires_in } = tokenResp;

	// Fetch the user info from Google
	const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	});
	if (!userResponse.ok) {
		return c.text(`Failed to fetch user info: ${await userResponse.text()}`, 500);
	}

	const { id, name, email, verified_email } = (await userResponse.json()) as {
		id: string;
		name: string;
		email: string;
		verified_email?: boolean;
	};

	/* ----- Allowlist gate ------------------------------------------------- */
	if (verified_email === false) {
		return c.html(renderDeniedPage(email + " (не підтверджено)"), 403);
	}
	if (!isEmailAllowed(email, c.env)) {
		return c.html(renderDeniedPage(email), 403);
	}
	/* ---------------------------------------------------------------------- */

	// Return back to the MCP client a new token, storing the Google tokens in props
	const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
		metadata: {
			label: name,
		},
		props: {
			accessToken: access_token,
			refreshToken: refresh_token || "",
			tokenExpiresAt: Date.now() + (expires_in - 60) * 1000, // 60s safety margin
			email,
			name,
		} as Props,
		request: oauthReqInfo,
		scope: oauthReqInfo.scope,
		userId: id,
	});

	return Response.redirect(redirectTo);
});

export { app as GoogleHandler };
