// Cloudflare Worker: scheduled cron to ping Next.js API routes on Pages
export interface Env {
  CRON_TARGET_BASE_URL: string; // e.g. https://www.elchef.se
}

export default {
  async scheduled(controller: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const base = env.CRON_TARGET_BASE_URL || 'https://www.elchef.se';
    const targets = [
      '/api/reminders/send',
      '/api/update-prices'
    ];
    await Promise.all(targets.map(path => fetch(base + path, { method: 'POST' }).catch(() => null)));
  }
} satisfies ExportedHandler<Env>;


