/**
 * Material Symbols Outlined — shared subset URL.
 *
 * Single source of truth for the icon font URL, imported by both:
 *  - layout.tsx  (server) → adds <link rel="preload"> so the CSS starts
 *    downloading at HTML-parse time (not after JS hydration).
 *  - MaterialSymbolsLoader (client) → activates the preloaded link as a
 *    stylesheet once the component mounts.
 *
 * font-display=swap: browser renders text immediately with a fallback, then
 * swaps in the icon font when it arrives. Icons are sized 1em×1em so they
 * don't shift surrounding text when they swap in (see globals.css).
 * Previously display=block caused a 30 ms delay reported by PageSpeed.
 *
 * Icon list covers every icon used across all pages & components.
 * Keep this list sorted alphabetically and in sync with usages.
 *
 * Icons used:
 *   arrow_forward, brightness_high, calendar_month, check_circle,
 *   chevron_left, chevron_right, cleaning_services, close,
 *   directions, directions_car, door_front, electric_bolt,
 *   expand_less, expand_more, face, filter_vintage, flight,
 *   language, local_fire_department, local_parking, location_on,
 *   lock, mail, map, menu, open_in_new, person, phone,
 *   privacy_tip, psychology, rate_review, schedule, science,
 *   self_improvement, shield, spa, star, support_agent,
 *   verified, verified_user, water_drop
 */
export const MATERIAL_SYMBOLS_HREF =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,200,0..1,0' +
  '&icon_names=arrow_forward,brightness_high,calendar_month,check_circle,' +
  'chevron_left,chevron_right,cleaning_services,close,directions,directions_car,' +
  'door_front,electric_bolt,expand_less,expand_more,face,filter_vintage,flight,' +
  'language,local_fire_department,local_parking,location_on,lock,mail,map,menu,' +
  'open_in_new,person,phone,privacy_tip,psychology,rate_review,schedule,science,' +
  'self_improvement,shield,spa,star,support_agent,verified,verified_user,water_drop' +
  '&display=swap'
