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

// Gestione notifica in background (evita duplicati)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Ricevuta notifica:', payload);

    const notificationTitle = payload.notification?.title || 'Magazzino Cloud';
    const notificationOptions = {
        body: payload.notification?.body || 'Nuovo aggiornamento disponibile',
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        data: { url: 'warehouse.html' }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestione del clic sulla notifica (apre warehouse.html ed evita la pagina vuota)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = './warehouse.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Se la pagina è già aperta, la porta in primo piano
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes('warehouse.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Altrimenti apre warehouse.html in una nuova finestra/tab della PWA
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});