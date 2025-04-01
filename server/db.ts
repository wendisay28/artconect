
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db;

try {
  const app = initializeApp({
    credential: cert({
      projectId: "buscart-e1beb",
      clientEmail: "firebase-adminsdk-fbsvc@buscart-e1beb.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDK96kIkij81P87\nI53p2hQYdNA2m6P9I8FaoPGv0Upla0EdS1ViwaIiinWmBvCY0P9wXAErMr7gtcdt\n7zixPuB69Ln8mAZtrIjlugdqsaATXRwNxutjTkxbvY8n+RYI9oYh7Cw9FYmlpjGz\n0521bfxXXZyrr7QbzNg7BrwCi7GbjI9rrfcVYWRf82lvkWqLTvEBToETenSAMI0l\nXcZcSVpxpQl1AQK9ER3BI82j0SVyM8iPsROBDtN7OsU0/AzUR+1N7u97iBYo0+sk\n/B9k9aZ6Qhlyg9UX9cKi9qE12QfFKyC6CBIHsYrZszPgnu5LHlcX7yjVCz2Vm0b7\nwwjYHGfVAgMBAAECggEAIos4F59Ynn9Z2STcsXpORUNMVJ70sBavx87wk23ZbZ1t\nfaDerWorQBm0oEc6F6gqcWMXR9ThK7mEca9vRKtg5UxVgyoUngHpYr/gl0YX6nPE\nXIvocARZdpuyi6kXGPtsJMXfWZ4ayTiZ6PMxOjm34t6p1YaX7stUWedxhDVmSwS5\nimQr7hWC0ZTtiInEJyP3sI6FwkyPHKYRztAyGgsN8otbmf00/C3cQxZZK/8amQg1\n+kUI7lkzYHJz96jPAxVPLaCS9MmQfYGcsay//aS1xyIbDr+XP+9akoqGhvJLBgqG\n603N+nFFkVrFZvCRWDIHEnasxnOSzxcKegyj2QDRmQKBgQDv/sJj44+LgGTIXnNy\njSe1FrKtcQnGhHofWEj2UkPc3mPXmDuvdzZKUS5WOH8OWnSy/dGCZ7aebWF/xsXx\n5htP+9la7mDJ/W/EzomKSqfUsyiyGyDKWmBXrrb3Ullv+n1u9Kw+A9vqMAcChp7S\nk8yUb8pcpy4atrbEGaJC/YVVLwKBgQDYgMHACSmjdpVOLbsIRHk+SpYsZEfLMhSQ\nqr70ET9fyyJkANT0rmbpQ+yOLdm4KaFFKPZOmZgQekZrKPja/X+Zz38Y8yM6kGvD\n2LuHmSnMjGRnjR/LXBJ9xtNat+r11sLhJYIsawqNpQdWoZwIml5+BVUPFGE3ML2k\nOslgUzUaOwKBgEtrIMVpNqvdHk7FN7xw1WCYEHBmzG6hJQuCn/MgaQkYrgGLan46\nlUoHdutLd8oX7QJutw8m7oGc1/3ihkP9Tun0uBpWPP5c8WnEif52dYVnA8vssIJG\nom4Ljp3sOATzj8V1iEc4yTwv+ZP2oCSGo8yl0M8LDncAojC/6Xjp2KOrAoGBANMb\nudEnHhLmbm/s55MIMbEryYM/xUG9c5Ac7lXO+5zM1pvss7pi1LZgJSn+S23oKfjm\nGEZMPprSoBedvArNZL72NVh+vLs+V9aAX1u5Xai2vLC8S2RgQyeh2DV9YP6WizA/\nAs+NEJ1NbfprW1qIK9t2F5q8pI7MWB7rs7DZcc5BAoGBANlQi3Pz6udMXrKFzwoC\nHwGL9Ivhh1cV0HW61CmvSyXQBBQGkJCrYoSD8kGA+V1M03MvYp2erK+/FbNx+wCo\niJS6IuTvPw74WghekbmakEBGlz0TDKaVfZMek1tfphXurgbs1ZVGXsnzIC+010Y1\nFESGbSHZenmkhNKcoUqFwxyo\n-----END PRIVATE KEY-----\n"
    })
  });

  db = getFirestore(app);
  console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin:', error);
  throw error;
}

export { db };
