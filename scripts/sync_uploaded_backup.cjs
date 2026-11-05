const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} = require('firebase/firestore');

const backupPath = path.resolve(__dirname, '../public/assets/aistudio/SIKLUS_SAMBUNG_Backup_2026-11-05__3__d79b016f.json');
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
const dbFilePath = path.resolve(__dirname, '../server_data/database.json');

const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log(`Starting sync with uploaded backup: ${backupPath}`);
console.log(`Backup exported at: ${backup.exportedAt} by ${backup.exportedBy?.displayName || 'admin'}`);
console.log(`Supervisions to sync: ${backup.supervisions.length}`);
console.log(`Schools to sync: ${backup.schools.length}`);

// 1. Update server_data/database.json
let currentDb = {
  schools: [],
  supervisions: [],
  users: [],
  deletedSupervisionIds: [],
  deletedUserIds: [],
  deletedUserNames: [],
  lastUpdated: new Date().toISOString()
};

if (fs.existsSync(dbFilePath)) {
  try {
    currentDb = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
  } catch (e) {
    console.warn('Error reading existing database.json, re-creating:', e.message);
  }
}

currentDb.schools = backup.schools;
currentDb.supervisions = backup.supervisions;
currentDb.deletedSupervisionIds = [];
currentDb.lastUpdated = backup.exportedAt || new Date().toISOString();
currentDb.syncState = {
  lastSyncedAt: backup.exportedAt || new Date().toISOString(),
  lastSyncedBy: backup.exportedBy?.uid || 'admin-kusnandar',
  lastSyncedByName: backup.exportedBy?.displayName || 'Kusnandar, M.Si',
  supervisionsCount: backup.supervisions.length,
  supervisionIds: backup.supervisions.map(s => s.id),
  schoolsCount: backup.schools.length,
  source: 'SIKLUS_SAMBUNG_Backup_2026-11-05 (3).json'
};

fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
fs.writeFileSync(dbFilePath, JSON.stringify(currentDb, null, 2), 'utf8');
console.log(`[Success] server_data/database.json updated with 9 supervisions and 11 schools.`);

// 2. Synchronize to Firestore
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function syncToFirestore() {
  console.log('Connecting to Firestore to apply uploaded backup...');
  
  // A. Upsert 11 Schools
  console.log('Syncing 11 schools to Firestore...');
  for (const sch of backup.schools) {
    await setDoc(doc(db, 'schools', sch.id), sch, { merge: true });
  }
  console.log('Schools synced successfully.');

  // B. Upsert 9 Supervisions
  console.log('Syncing 9 supervisions to Firestore...');
  const validSupIds = new Set(backup.supervisions.map(s => s.id));
  for (const sup of backup.supervisions) {
    await setDoc(doc(db, 'supervisions', sup.id), sup, { merge: true });
  }
  console.log('9 supervisions synced successfully.');

  // C. Find and remove old/stale supervisions not in the backup
  console.log('Checking for old/stale supervisions in Firestore...');
  const currentFirestoreSups = await getDocs(collection(db, 'supervisions'));
  let deletedCount = 0;
  for (const docSnap of currentFirestoreSups.docs) {
    if (!validSupIds.has(docSnap.id)) {
      console.log(`- Deleting obsolete supervision from Firestore: ${docSnap.id} (${docSnap.data().teacherName})`);
      await deleteDoc(doc(db, 'supervisions', docSnap.id));
      deletedCount++;
    }
  }
  console.log(`Obsolete supervisions purged: ${deletedCount}. Exactly ${validSupIds.size} remain.`);

  // D. Write sync state document
  console.log('Writing system/sync_state to Firestore...');
  await setDoc(doc(db, 'system', 'sync_state'), {
    lastSyncedAt: backup.exportedAt || new Date().toISOString(),
    lastSyncedBy: backup.exportedBy?.uid || 'admin-kusnandar',
    lastSyncedByName: backup.exportedBy?.displayName || 'Kusnandar, M.Si',
    supervisionsCount: backup.supervisions.length,
    supervisionIds: Array.from(validSupIds),
    schoolsCount: backup.schools.length,
    source: 'SIKLUS_SAMBUNG_Backup_2026-11-05 (3).json',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log('All data synchronized successfully to Firebase Firestore!');
}

syncToFirestore()
  .then(() => {
    console.log('[COMPLETE] Sync finished without errors.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[ERROR] Failed syncing to Firestore:', err);
    process.exit(1);
  });
