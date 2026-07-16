/**
 * Material Symbols Outlined — shared subset URL.
 *
 * The font is self-hosted at public/fonts/material-symbols-outlined.woff2
 * (see the @font-face in globals.css). This URL is the source it was
 * subset from — to update, add the icon name below, re-download the CSS
 * from MATERIAL_SYMBOLS_HREF, and replace the woff2 with the file it points to.
 *
 * font-display=swap: browser renders text immediately with a fallback, then
 * swaps in the icon font when it arrives. Icons are sized 1em×1em so they
 * don't shift surrounding text when they swap in (see globals.css).
 * Previously display=block caused a 30 ms delay reported by PageSpeed.
 *
 * Icon list covers every icon used across all pages & components,
 * including admin pages and icon names stored in landing configs
 * (data/landings.json / Supabase / KV).
 * Keep this list sorted alphabetically and in sync with usages —
 * an icon missing from the subset renders as its raw ligature text
 * (e.g. "event" shows a broken "E…" instead of the glyph).
 */
const ICON_NAMES = [
  'add',
  'add_alert',
  'ads_click',
  'arrow_back',
  'arrow_forward',
  'article',
  'brightness_high',
  'calendar_month',
  'call',
  'campaign',
  'check_circle',
  'chevron_left',
  'chevron_right',
  'cleaning_services',
  'close',
  'dashboard',
  'delete',
  'directions',
  'directions_car',
  'eco',
  'edit',
  'electric_bolt',
  'error',
  'event',
  'expand_less',
  'expand_more',
  'face',
  'filter_alt',
  'filter_vintage',
  'flight',
  'home',
  'info',
  'language',
  'layers',
  'local_fire_department',
  'local_parking',
  'location_on',
  'lock',
  'logout',
  'mail',
  'manage_search',
  'map',
  'meeting_room',
  'menu',
  'notifications_active',
  'open_in_new',
  'pause_circle',
  'payments',
  'person',
  'phone',
  'privacy_tip',
  'psychology',
  'radio_button_unchecked',
  'rate_review',
  'rocket_launch',
  'save',
  'schedule',
  'science',
  'self_improvement',
  'settings',
  'shield',
  'spa',
  'star',
  'support_agent',
  'sync',
  'today',
  'verified',
  'verified_user',
  'water_drop',
]

export const MATERIAL_SYMBOLS_HREF =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0..1,0' +
  `&icon_names=${ICON_NAMES.join(',')}` +
  '&display=swap'
