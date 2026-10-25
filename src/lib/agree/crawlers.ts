/**
 * Chat apps fetch link previews with a short crawler UA.
 * In-app browsers (a friend actually opening the link) include Mozilla
 * and must get the real page, not the preview HTML.
 */
export function isShareCrawler(userAgent: string | null | undefined): boolean {
  const ua = userAgent ?? ''
  if (
    /Twitterbot|facebookexternalhit|Facebot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|redditbot|Iframely|embedly|SkypeUriPreview|Slack-ImgProxy|vkShare|Applebot|Googlebot|bingbot|DuckDuckBot/i.test(
      ua,
    )
  ) {
    return true
  }
  return /WhatsApp/i.test(ua) && !/Mozilla/i.test(ua)
}

export function shouldRewriteSharePreview(userAgent: string | null, pathname: string): boolean {
  return /^\/agree\/c\/[^/]+$/.test(pathname) && isShareCrawler(userAgent)
}
