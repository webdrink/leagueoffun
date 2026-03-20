/* eslint-disable no-restricted-globals */
// Cleanup worker to remove legacy cached "coming soon" builds.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

    await self.registration.unregister();

    const clientsList = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    });

    clientsList.forEach((client) => {
      client.navigate(client.url);
    });
  })());
});
