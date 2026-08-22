import { getToken, clearAuth } from "./auth";
import { getUtm, utmQueryString } from "./utm";

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
    throw new ApiError(0, "connection failed. Check your network and try again.");
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON body; fall through to error below
  }

  if (res.ok && json?.success) return json.data;
  if (res.status === 401) clearAuth();
  throw new ApiError(res.status, json?.error || "something went wrong. Try again.");
}

export const api = {
  // auth
  // The three account-creation calls carry first-touch UTM; login deliberately
  // does not, so a returning user never overwrites their original attribution.
  signup: (fields) =>
    request("/auth/signup", { method: "POST", body: { ...getUtm(), ...fields } }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  googleInit: () => request("/auth/google"),
  googleCallback: (code, state) =>
    request(
      `/auth/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}${utmQueryString()}`
    ),
  googleCredential: (credential) =>
    request("/auth/google/credential", {
      method: "POST",
      body: { credential, ...getUtm() },
    }),
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
  invite: (email) =>
    request("/team/invite", { method: "POST", body: { email } }),
  cancelInvite: (id) =>
    request(`/team/invite/${encodeURIComponent(id)}/cancel`, { method: "POST" }),
  joinTeam: (joinCode) =>
    request("/team/join", { method: "POST", body: { join_code: joinCode } }),
  leaveTeam: () => request("/team/leave", { method: "POST" }),
  kickMember: (userId) =>
    request(`/team/members/${encodeURIComponent(userId)}/kick`, { method: "POST" }),
  // The server reads role from the DB per request, so no token refresh is
  // needed — but your_role is stale for both users until GET /team is refetched.
  transferLeadership: (userId) =>
    request("/team/leader", { method: "POST", body: { new_leader_id: userId } }),

  // invites (receiving side)
  listInvites: () => request("/invites"),
  acceptInvite: (id) =>
    request(`/invites/${encodeURIComponent(id)}/accept`, { method: "POST" }),
  declineInvite: (id) =>
    request(`/invites/${encodeURIComponent(id)}/decline`, { method: "POST" }),

  // selection fee
  // The per-member fee a shortlisted team pays after evaluation. This is NOT
  // the ₹100 registration payment, which used POST /payment and is handled out
  // of band now — the paths are kept apart on purpose so neither payment can be
  // credited as the other.
  //
  // Always pays for the authenticated user. There is no path for one member to
  // submit on another's behalf.
  submitSelectionPayment: (transactionId) =>
    request("/payment/selection", {
      method: "POST",
      body: { transaction_id: transactionId },
    }),

  // idea submission
  // Both PUTs replace the whole record, so callers must send every field —
  // build bodies with toApplicationPayload / toMemberPayload in lib/submission.js
  // rather than assembling them by hand.
  getApplication: () => request("/team/application"),
  putApplication: (fields) =>
    request("/team/application", { method: "PUT", body: fields }),
  putMemberDetails: (userId, fields) =>
    request(`/team/application/members/${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: fields,
    }),

  // link checks
  // Advisory only: nothing is stored and PUT /team/application never calls
  // these. A failed check is a warning beside the field, never a blocker.
  verifyDriveLink: (url) =>
    request("/links/verify/drive", { method: "POST", body: { url } }),
  verifyYoutubeLink: (url) =>
    request("/links/verify/youtube", { method: "POST", body: { url } }),
};
