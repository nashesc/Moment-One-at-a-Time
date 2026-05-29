import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:jonasm.escanilla@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    )
    return { success: true }
  } catch (error) {
    console.error('Push notification error:', error)
    return { success: false, error: error.message }
  }
}