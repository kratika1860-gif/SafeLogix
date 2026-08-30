import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

if (getApps().length === 0) {
  initializeApp({
    projectId: firebaseConfig.projectId
  });
}

async function seedUser() {
  const email = 'driver@example.com';
  const password = 'Password123!';
  
  try {
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: 'Test Driver',
    });
    console.log('Successfully created new user:', userRecord.uid);
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.log('User already exists. Updating password just in case.');
      const user = await getAuth().getUserByEmail(email);
      await getAuth().updateUser(user.uid, { password });
      console.log('Password updated.');
    } else {
      console.error('Error creating new user:', error);
    }
  }
}

seedUser().then(() => process.exit(0));
