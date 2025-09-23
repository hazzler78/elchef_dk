// Cloudflare Worker: scheduled cron to ping Next.js API routes on Pages
export default {
  async scheduled(controller, env, ctx) {
    const base = (env && env.CRON_TARGET_BASE_URL) || 'https://www.elchef.se';
    const targets = [
      '/api/reminders/send',
      '/api/update-prices'
    ];
    await Promise.all(
      targets.map((path) => fetch(base + path, { method: 'POST' }).catch(() => null))
    );
  },
};


