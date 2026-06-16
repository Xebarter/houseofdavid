/**
 * Add a hosting domain to Firebase Authentication authorized domains.
 *
 * Usage:
 *   npm run firebase:add-domain
 *   npm run firebase:add-domain -- custom.example.com
 *
 * Requires Firebase Admin credentials (same as set-admin-claim).
 */
const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');
const { JWT } = require('google-auth-library');

function loadEnvFile() {
  const envPath = resolve(__dirname, '../../.env');
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  let currentKey = null;
  let currentValue = [];

  const flush = () => {
    if (!currentKey) return;
    const value = currentValue.join('\n').trim();
    if (!process.env[currentKey]) {
      process.env[currentKey] = value.replace(/^["']|["']$/g, '');
    }
    currentKey = null;
    currentValue = [];
  };

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (currentKey && /^\s/.test(line)) {
      currentValue.push(line);
      continue;
    }

    flush();
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    currentKey = trimmed.slice(0, eq).trim();
    currentValue = [trimmed.slice(eq + 1)];
  }

  flush();
}

loadEnvFile();

const { getAdminCredential, printMissingCredentialHelp } = require('./admin-credentials.cjs');

const DEFAULT_DOMAIN = 'houseofdavid-woad.vercel.app';
const domainArg = process.argv[2]?.trim().toLowerCase();
const domain = (domainArg || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_DOMAIN)
  .replace(/^https?:\/\//, '')
  .replace(/\/.*$/, '');

const credential = getAdminCredential();
const projectId =
  credential?.projectId ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!credential?.clientEmail || !credential?.privateKey || !projectId) {
  printMissingCredentialHelp(projectId);
  process.exit(1);
}

async function getAccessToken() {
  const client = new JWT({
    email: credential.clientEmail,
    key: credential.privateKey,
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/identitytoolkit',
    ],
  });
  const token = await client.getAccessToken();
  if (!token) throw new Error('Failed to obtain Google access token');
  return token;
}

async function getAuthConfig(token) {
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to read Auth config (${res.status}): ${body}`);
  }
  return res.json();
}

async function updateAuthConfig(token, authorizedDomains) {
  const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=authorizedDomains`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ authorizedDomains }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to update Auth config (${res.status}): ${body}`);
  }
  return res.json();
}

async function main() {
  console.log(`Project: ${projectId}`);
  console.log(`Domain:  ${domain}`);

  const token = await getAccessToken();
  const config = await getAuthConfig(token);
  const current = Array.isArray(config.authorizedDomains) ? config.authorizedDomains : [];

  if (current.includes(domain)) {
    console.log(`Already authorized: ${domain}`);
    console.log('Authorized domains:', current.join(', '));
    return;
  }

  const next = [...current, domain];
  await updateAuthConfig(token, next);

  console.log(`Added authorized domain: ${domain}`);
  console.log('Authorized domains:', next.join(', '));
  console.log('\nIf Google sign-in still fails on this domain, also verify in Google Cloud Console:');
  console.log('  APIs & Services → Credentials → Web client (auto created by Firebase)');
  console.log(`  Authorized JavaScript origins includes https://${domain}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
