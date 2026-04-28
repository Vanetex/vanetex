function safeUrl(url) {
  // Only allow relative paths or same-origin absolute URLs
  if (!url) return "/challenge";
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.origin === self.location.origin) return url;
  } catch { /* fall through */ }
  return "/challenge";
}

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { body: event.data.text() }; }

  const title = data.title ?? "Vanetex";
  const options = {
    body: data.body ?? "Today's challenge is waiting.",
    icon: "/pwa-icon?size=192",
    badge: "/pwa-icon?size=96",
    tag: data.tag ?? "vanetex-daily",
    renotify: true,
    data: { url: safeUrl(data.url) },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = safeUrl(event.notification.data?.url);
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
