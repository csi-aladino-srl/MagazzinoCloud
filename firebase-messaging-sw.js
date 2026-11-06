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

// Gestione della notifica quando l'app è in background (riceve i dati dalla Console Firebase)
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Notifica ricevuta dalla Console Firebase:', payload);

    // Legge i dati inseriti nella Console Firebase (sezione Notifica)
    const title = payload.notification?.title || 'Magazzino Cloud';
    const body = payload.notification?.body || 'Nuovo aggiornamento disponibile';
    
    // URL di destinazione al click
    const clickUrl = 'warehouse.html';

    const notificationOptions = {
        body: body,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        data: { url: clickUrl }
    };

    // Mostra la notifica una sola volta
    self.registration.showNotification(title, notificationOptions);
});

// Gestione del click sulla notifica (apre warehouse.html evitando pagine vuote su iOS)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || './warehouse.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes('warehouse.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});