import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

function resolveCredentialPath(filePath: string | undefined): string | null {
  if (!filePath) return null;
  const candidates = [resolve(process.cwd(), filePath)];
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

  const jsonPath = resolveCredentialPath(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
  if (jsonPath) {
    const json = JSON.parse(readFileSync(jsonPath, 'utf8')) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    return {
      projectId: projectId || json.project_id,
      clientEmail: json.client_email,
      privateKey: json.private_key,
    };
  }

  return null;
}

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  const credential = getAdminCredential();
  const { projectId, clientEmail, privateKey } = credential ?? {};

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials missing. Add FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY to .env.'
    );
  }

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return adminApp;
}

export function getAdminDb() {
  const databaseId =
    process.env.FIRESTORE_DATABASE_ID ||
    process.env.NEXT_PUBLIC_FIRESTORE_DATABASE_ID ||
    'houseofdavid';
  return getFirestore(getAdminApp(), databaseId);
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export async function verifyAdminToken(idToken: string): Promise<boolean> {
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return decoded.admin === true;
  } catch {
    return false;
  }
}
