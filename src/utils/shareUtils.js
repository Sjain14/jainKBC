/**
 * shareUtils.js
 * Helper utilities and share messages for Jain KBC (कौन बनेगा ज्ञानवान).
 */

export const SHARE_DATA = {
  title: 'कौन बनेगा ज्ञानवान | Madhoganj Parivar',
  quizUrl: 'https://jainkbc.vercel.app/play',
  linktreeUrl: 'https://linktr.ee/madhoganjparivar',
}

export const SHARE_MESSAGE_TEXT = `✨ *जय जिनेन्द्र!* ✨
*कौन बनेगा ज्ञानवान (Jain KBC)* 🏆
माधवगंज परिवार दशलक्षण महापर्व

दशलक्षण महापर्व के पावन अवसर पर ज्ञान और धर्म के इस अद्भुत क्विज़ में भाग लें और ज्ञानवान बनें! 🌟

📲 *क्विज़ में भाग लेने के लिए लिंक:*
👉 ${SHARE_DATA.quizUrl}

📱 *माधवगंज परिवार से जुड़ने के लिए (Instagram, Facebook & Links):*
👉 ${SHARE_DATA.linktreeUrl}

अपने परिवार और मित्रों के साथ अवश्य साझा करें!`

/**
 * Trigger native share or fallback to WhatsApp / clipboard
 */
export async function shareGame({ onCopied: _onCopied } = {}) {
  const sharePayload = {
    title: SHARE_DATA.title,
    text: SHARE_MESSAGE_TEXT,
    url: SHARE_DATA.quizUrl,
  }

  // Check if Web Share API with text is available
  if (navigator.share) {
    try {
      await navigator.share(sharePayload)
      return { success: true, method: 'native' }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Fallback to WhatsApp
        openWhatsAppShare()
        return { success: true, method: 'whatsapp' }
      }
      return { success: false, aborted: true }
    }
  } else {
    // Open WhatsApp directly
    openWhatsAppShare()
    return { success: true, method: 'whatsapp' }
  }
}

export function openWhatsAppShare() {
  const encoded = encodeURIComponent(SHARE_MESSAGE_TEXT)
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
}

export async function copyShareText() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(SHARE_MESSAGE_TEXT)
    return true
  }
  return false
}
