# Деплой Ridni MCP (GA4 + Search Console)

Воркер: `ridni-mcp` на Cloudflare Workers, адреса `https://ridni-mcp.<subdomain>.workers.dev`.
Деплой — через Workers Builds (автоматично з гілки `main` форку).

Ендпоінти для конекторів:

- `https://ridni-mcp.<subdomain>.workers.dev/mcp` — Streamable HTTP (основний, для Claude)
- `https://ridni-mcp.<subdomain>.workers.dev/sse` — SSE (застарілий транспорт, для сумісності)

## 1. Cloudflare: підключити репо

1. Dashboard → Workers & Pages → Create → Import a repository → вибрати форк.
2. Налаштування:
   - Project name: `ridni-mcp` (має збігатися з `name` у `wrangler.jsonc`)
   - Build command: `npm ci`
   - Deploy command: `npx wrangler deploy`
   - Production branch: `main`
3. Save and Deploy. KV namespace для `OAUTH_KV` уже прописаний у `wrangler.jsonc` (`bf41a3bc236346c4acfbea1b152cd7ab`).
4. Записати адресу воркера (`ridni-mcp.<subdomain>.workers.dev`) — вона потрібна для Google.

На цьому етапі сервер відповідає, але вхід ще не працює — бракує секретів.

## 2. Google Cloud: OAuth-клієнт

1. Створити проєкт (напр. `ridni-mcp`) на https://console.cloud.google.com/projectcreate
2. APIs & Services → Library → увімкнути:
   - Google Analytics Admin API
   - Google Analytics Data API
   - Google Search Console API
3. Google Auth Platform → Branding/Audience:
   - User type: **External** (бо будуть зовнішні акаунти)
   - App name: `Ridni MCP`, support email — адмінський
   - Publishing status: **In production** (див. примітку нижче)
4. Clients → Create client → Web application:
   - Authorized redirect URI: `https://ridni-mcp.<subdomain>.workers.dev/callback`
5. Зберегти Client ID і Client Secret у менеджер паролів.

**Чому In production, а не Testing.** У режимі Testing для External-застосунків Google
анулює refresh token через 7 днів — конектор доведеться перепідключати щотижня.
У Production без верифікації користувачі один раз побачать екран «Google hasn't verified
this app» (Advanced → Go to Ridni MCP) — для внутрішньої команди це нормально; ліміт
неверифікованого застосунку — 100 користувачів.

## 3. Cloudflare: секрети

Workers & Pages → `ridni-mcp` → Settings → Variables and Secrets → Add → тип **Secret**:

| Назва | Значення |
|---|---|
| `GOOGLE_CLIENT_ID` | з кроку 2 |
| `GOOGLE_CLIENT_SECRET` | з кроку 2 |
| `COOKIE_ENCRYPTION_KEY` | випадковий рядок, напр. результат `openssl rand -hex 32` |
| `HOSTED_DOMAIN` | порожньо (бо є зовнішні акаунти) |
| `ALLOWED_DOMAINS` | `ridni.org.ua` |
| `ALLOWED_EMAILS` | зовнішні акаунти через кому, напр. `agency@gmail.com` |

Саме тип Secret: звичайні змінні з дашборду перезаписуються при наступному `wrangler deploy`.
Після збереження — Deploy (або будь-який push у `main`).

## 4. Перевірка

```bash
npx @modelcontextprotocol/inspector@latest
```

Transport: Streamable HTTP, URL `https://ridni-mcp.<subdomain>.workers.dev/mcp` → Connect →
вхід через Google → викликати `gsc_list_sites` і `ga4_list_account_summaries`.
Вхід з акаунта поза allowlist має показати сторінку «Доступ заборонено».

## 5. Підключення в Claude

Organization settings → Connectors → Add custom connector → URL
`https://ridni-mcp.<subdomain>.workers.dev/mcp`. Кожен користувач проходить вхід через
свій Google-акаунт і бачить лише ті GA4/GSC-ресурси, до яких має доступ.

## Обслуговування

- Додати/прибрати людину: змінити секрет `ALLOWED_EMAILS` → Deploy. Видалені втрачають
  можливість нового входу; щоб відкликати вже видані токени — очистити KV `OAUTH_KV`.
- Логи: Workers → `ridni-mcp` → Logs (observability увімкнено) або `npx wrangler tail ridni-mcp`.
