importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCbyma9BDUgpG5KUMyLJxbFjuPsuLpYyMA",
    authDomain: "warehouse-manager-462a0.firebaseapp.com",
    projectId: "warehouse-manager-462a0",
    storageBucket: "warehouse-manager-462a0.firebasestorage.app",
    messagingSenderId: "234467047556",
    appId: "1:234467047556:web:50c352780b476574b86ad1",
    measurementId: "G-KM84BW8EPH"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Gestione notifiche in background
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Notifica in background ricevuta:', payload);

    const notificationTitle = payload.notification?.title || 'Notifica Magazzino';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});