const BASE = import.meta.env.VITE_API_BASE;

function post(path, data) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export const api = {
  waitlist: (data) => post("/waitlist", data),
  apply:    (data) => post("/apply", data),
};
