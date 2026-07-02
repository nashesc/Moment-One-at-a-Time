import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_CONTACT_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface PushPayload { title: string; body: string; url?: string }
export interface PushSubscriptionData { endpoint: string; keys: { p256dh: string; auth: string } }

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return { success: true }
  } catch (error) {
    console.error('Push notification error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}