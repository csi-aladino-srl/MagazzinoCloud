importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCbyma9BDUgpG5KUMyLJxbFjuPsuLpYyMA",
    authDomain: "warehouse-manager-462a0.firebaseapp.com",
    projectId: "warehouse-manager-462a0",
    storageBucket: "warehouse-manager-462a0.firebasestorage.app",
    messagingSenderId: "234467047556",
    appId: "1:234467047556:web:50c352780b476574b86ad1",
    measurementId: "G-KM84BW8EPH"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Messaggio ricevuto in background: ', payload);

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
            // Cattura dinamicamente l'URL passato da Firebase (con un fallback di sicurezza)
            data: {
                url: payload.data.url || '/'
            }
        };
        self.registration.showNotification(title, options);
    }
});

// Gestisce il click aprendo esattamente l'URL ricevuto nei dati
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Usa l'URL nei dati o forza warehouse.html come percorso assoluto dell'host
    const targetUrl = event.notification.data?.url || `${self.location.origin}/warehouse.html`;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});