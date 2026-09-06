import { getMealToken } from "./mealAuth";

const BASE = import.meta.env.VITE_STARTATHON_API_BASE;

export class MealApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "MealApiError";
    this.status = status; // 0 = network failure
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { Authorization: getMealToken() };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new MealApiError(0, "Connection failed. Check your network and try again.");
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON body; fall through to error below
  }

  if (res.ok && json?.success) return json.data;
  // A 404 here means a bad token, an unknown meal key, or "not shortlisted" —
  // the API deliberately doesn't distinguish them. Surface its message as-is.
  throw new MealApiError(res.status, json?.error || "Something went wrong. Try again.");
}

// Fixed and hardcoded per the API doc — anything else in the path is a 404.
export const MEAL_KEYS = [
  { key: "day1-lunch", label: "Day 1 — Lunch" },
  { key: "day1-dinner", label: "Day 1 — Dinner" },
  { key: "day2-breakfast", label: "Day 2 — Breakfast" },
  { key: "day2-lunch", label: "Day 2 — Lunch" },
];

export const mealsApi = {
  summary: () => request("/meals"),
  teams: (mealKey) => request(`/meals/${mealKey}/teams`),
  people: (mealKey) => request(`/meals/${mealKey}/people`),
  mark: (mealKey, { userId, markedBy, note }) =>
    request(`/meals/${mealKey}/mark`, {
      method: "POST",
      body: { user_id: userId, marked_by: markedBy || undefined, note: note || undefined },
    }),
  unmark: (mealKey, userId) =>
    request(`/meals/${mealKey}/mark/${encodeURIComponent(userId)}`, { method: "DELETE" }),
};
