import { getToken, clearAuth } from "./auth";

const BASE = import.meta.env.VITE_STARTATHON_API_BASE;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = network failure
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "connection failed — check your network and retry");
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON body; fall through to error below
  }

  if (res.ok && json?.success) return json.data;
  if (res.status === 401) clearAuth();
  throw new ApiError(res.status, json?.error || "something went wrong — try again");
}

export const api = {
  // auth
  signup: (fields) => request("/auth/signup", { method: "POST", body: fields }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  googleInit: () => request("/auth/google"),
  googleCallback: (code, state) =>
    request(
      `/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
    ),
  requestReset: (email) =>
    request("/auth/password/reset", { method: "POST", body: { email } }),
  verifyReset: (token, newPassword) =>
    request("/auth/password/reset/verify", {
      method: "POST",
      body: { token, new_password: newPassword },
    }),

  // account
  getMe: () => request("/me"),
  updateMe: (fields) => request("/me", { method: "PATCH", body: fields }),

  // team
  createTeam: (teamName) =>
    request("/team", { method: "POST", body: { team_name: teamName } }),
  getTeam: () => request("/team"),
  invite: (email, name) =>
    request("/team/invite", {
      method: "POST",
      body: name ? { email, name } : { email },
    }),
  joinTeam: (joinCode) =>
    request("/team/join", { method: "POST", body: { join_code: joinCode } }),
  leaveTeam: () => request("/team/leave", { method: "POST" }),
  kickMember: (userId) =>
    request(`/team/members/${encodeURIComponent(userId)}/kick`, { method: "POST" }),

  // invites (receiving side)
  listInvites: () => request("/invites"),
  acceptInvite: (id) =>
    request(`/invites/${encodeURIComponent(id)}/accept`, { method: "POST" }),
  declineInvite: (id) =>
    request(`/invites/${encodeURIComponent(id)}/decline`, { method: "POST" }),

  // payment
  submitPayment: (transactionId) =>
    request("/payment", { method: "POST", body: { transaction_id: transactionId } }),
};
