const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');

function resolvePath(filePath) {
  if (!filePath) return null;
  const candidates = [
    resolve(process.cwd(), filePath),
    resolve(__dirname, '../..', filePath),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function getAdminCredential() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  const jsonPath = resolvePath(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
  if (jsonPath) {
    const json = JSON.parse(readFileSync(jsonPath, 'utf8'));
    return {
      projectId: projectId || json.project_id,
      clientEmail: json.client_email,
      privateKey: json.private_key,
    };
  }

  return null;
}

function printMissingCredentialHelp(projectId) {
  console.error(
    'Missing Firebase Admin credentials.\n\n' +
      'Your NEXT_PUBLIC_FIREBASE_* vars are for the website only — they cannot grant admin claims.\n\n' +
      (projectId
        ? `Project ID is OK (${projectId}).\n\n`
        : '') +
      'Option A (easiest): download the service account JSON from Firebase Console\n' +
      '  → Project Settings → Service accounts → Generate new private key\n' +
      '  Save it as firebase/service-account.json and add to .env:\n' +
      '  FIREBASE_SERVICE_ACCOUNT_PATH=firebase/service-account.json\n\n' +
      'Option B: copy fields from that JSON into .env:\n' +
      '  FIREBASE_CLIENT_EMAIL=\n' +
      '  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"'
  );
}

module.exports = { getAdminCredential, printMissingCredentialHelp };
