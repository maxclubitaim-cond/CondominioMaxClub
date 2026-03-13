import webpush from 'web-push';

// Chaves VAPID (Oficiais geradas anteriormente)
const VAPID_PUBLIC_KEY = 'BAA1cYTGg1u0VJmVEK4YQ_WExYlH6P__CaD8bvTzkXLeU34q1XNQBRqYW627FdaLgVNKEhSs92tEjUHW6WJuuM8';
const VAPID_PRIVATE_KEY = 'mJ5fzEm5xhPOPESIh9JcJifypw0BRUWhdrVQXEXF0qU';

webpush.setVapidDetails(
    'mailto:maxclubitaim@gmail.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { notification, subscriptions } = req.body;

    if (!notification || !subscriptions || !Array.isArray(subscriptions)) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    console.log(`API: Disparando para ${subscriptions.length} dispositivos.`);

    const payload = JSON.stringify(notification);

    const results = await Promise.allSettled(
        subscriptions.map(sub => 
            webpush.sendNotification(sub.subscription, payload)
        )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.length - successCount;

    console.log(`API: Sucesso: ${successCount}, Falha: ${failCount}`);

    return res.status(200).json({
        success: true,
        count: successCount,
        failures: failCount
    });
}
