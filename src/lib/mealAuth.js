const KEY_TOKEN = "st_meal_token";
const KEY_MARKER = "st_meal_marker";

// The meal API's shared staff token, entered once per device and kept only
// in that device's localStorage — never bundled into the built JS. Anyone
// loading the site never sees it; only a staff member who types it in does.
export const getMealToken = () => localStorage.getItem(KEY_TOKEN) || "";
export const saveMealToken = (token) => localStorage.setItem(KEY_TOKEN, token);
export const clearMealToken = () => localStorage.removeItem(KEY_TOKEN);

// "marked_by" is a free-text log label (e.g. "counter-2"), not an identity —
// remembered locally so a counter doesn't retype it between scans.
export const getMarker = () => localStorage.getItem(KEY_MARKER) || "";
export const saveMarker = (name) => localStorage.setItem(KEY_MARKER, name);
