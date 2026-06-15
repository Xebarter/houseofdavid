/**
 * Grant admin custom claims to a Firebase Auth user.
 *
 * Usage:
 *   npm run set-admin-claim -- user@gmail.com
 *   node --env-file=.env firebase/scripts/set-admin-claim.cjs user@gmail.com
 *
 * Prerequisites:
 *   - FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env
 *   - User must exist in Firebase Auth (sign in once via email or Google first)
 */
const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

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

const email = process.argv[2];
if (!email) {
  console.error('Usage: npm run set-admin-claim -- <user-email>');
  process.exit(1);
}

const credential = getAdminCredential();

if (!credential?.projectId || !credential?.clientEmail || !credential?.privateKey) {
  printMissingCredentialHelp(
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
  process.exit(1);
}

const { projectId, clientEmail, privateKey } = credential;

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function main() {
  const user = await getAuth().getUserByEmail(email);
  await getAuth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`Admin claim set for ${email} (uid: ${user.uid})`);
  console.log('User must sign out and sign back in for the claim to take effect.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
