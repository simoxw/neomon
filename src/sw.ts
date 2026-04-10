/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any;
};

// Pulizia cache obsoleta
cleanupOutdatedCaches();

// Pre-cache di tutti i file generati (JS, CSS, HTML, WebP)
precacheAndRoute(self.__WB_MANIFEST);

// Cache per gli sprite con aggiornamento in background
registerRoute(
  ({ url }) => url.pathname.includes('assets/sprites/'),
  new StaleWhileRevalidate({
    cacheName: 'neomon-sprites-cache'
  })
);

// Forza l'attivazione immediata del nuovo SW
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
