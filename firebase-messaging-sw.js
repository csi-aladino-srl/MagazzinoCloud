importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

const TARGET_URL = 'https://csi-aladino-srl.github.io/MagazzinoCloud/warehouse.html';
const APP_SCOPE = 'https://csi-aladino-srl.github.io/MagazzinoCloud/';

// 1. REGISTRA PRIMA DI firebase.messaging() per avere priorità assoluta sul click
self.addEventListener('notificationclick', (event) => {
    event.stopImmediatePropagation();
    event.notification.close();

    event.waitUntil((async () => {
        const windowClients = await clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        });

        // Caso A: warehouse.html è già aperta (anche con query ?... o #...) -> portala in primo piano
        for (const client of windowClients) {
            if (client.url.startsWith(TARGET_URL) && 'focus' in client) {
                return client.focus();
            }
        }

        // Caso B: La PWA è aperta su un'altra pagina (es. index.html / login) -> focus + redirect
        for (const client of windowClients) {
            if (client.url.startsWith(APP_SCOPE) && 'focus' in client) {
                await client.focus();
                if ('navigate' in client) {
                    return client.navigate(TARGET_URL);
                }
            }
        }

        // Caso C: La PWA è chiusa -> aprila direttamente su warehouse.html
        if (clients.openWindow) {
            return clients.openWindow(TARGET_URL);
        }
    })());
});

firebase.initializeApp({
    apiKey: "AIzaSyCbyma9BDUgpG5KUMyLJxbFjuPsuLpYyMA",
    authDomain: "warehouse-manager-462a0.firebaseapp.com",
    projectId: "warehouse-manager-462a0",
    storageBucket: "warehouse-manager-462a0.firebasestorage.app",
    messagingSenderId: "234467047556",
    appId: "1:234467047556:web:50c352780b476574b86ad1",
    measurementId: "G-KM84BW8EPH"
});

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    // Se il payload ha già "notification", il browser la mostra da solo
    // e il listener notificationclick qui sopra gestirà comunque il redirect.
    if (payload.notification) {
        return;
    }

    if (payload.data) {
        const title = payload.data.title || 'Magazzino Cloud';
        const options = {
            body: payload.data.body || 'Hai un nuovo aggiornamento.',
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            tag: 'magazzino-notifica-unica',
            data: { url: TARGET_URL }
        };
        self.registration.showNotification(title, options);
    }
});
