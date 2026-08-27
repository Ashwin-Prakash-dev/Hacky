import { ARRIVAL_DATE } from "./phase";

// The food and travel answers the event is actually planned around. Kept apart
// from teamRules.js because none of it is a rule: it is shape and formatting
// for one form. The server takes every field as optional; the form requires
// food, because a headcount is the one answer nobody else can supply.

export const FOOD_OPTIONS = [
  { value: "veg", label: "Vegetarian" },
  { value: "non-veg", label: "Non-vegetarian" },
];

// Two values because that is what a kitchen cooks to. Vegan, Jain, allergies
// and everything else a cook needs to read goes in dietary_notes, where a
// person reads it, rather than into an enum that always misses a case.
export const TRAVEL_MODES = [
  { value: "train", label: "Train" },
  { value: "bus", label: "Bus" },
  { value: "car", label: "Car" },
  { value: "flight", label: "Flight" },
  { value: "own", label: "Own vehicle" },
  { value: "other", label: "Other" },
];

export const foodLabel = (value) =>
  FOOD_OPTIONS.find((o) => o.value === value)?.label ?? null;

export const travelLabel = (value) =>
  TRAVEL_MODES.find((o) => o.value === value)?.label ?? null;

// Filled in means the food answer is there, and only that. It is the one answer
// with a hard count behind it and the one nobody else can give on your behalf;
// travel plans change and half of them are honestly unknown when the form is
// first opened. The rest is asked for and never counted, and nothing anywhere
// blocks a save.
export const isComplete = (row) => !!row?.food_preference;

const orNull = (value) => {
  const trimmed = typeof value === "string" ? value.trim() : value;
  return trimmed === "" || trimmed === undefined ? null : trimmed;
};

// Only a time is ever asked for: everyone arrives on ARRIVAL_DATE, so the date
// is the event's rather than the traveller's. The pair below is the whole
// conversion, and it is anchored to IST on purpose. A time typed as "14:30"
// means half past two at the venue, whatever zone the device answering happens
// to be set to.
export const timeToEpoch = (time) => {
  if (!time) return null;
  const ms = new Date(`${ARRIVAL_DATE}T${time}:00+05:30`).getTime();
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
};

const IST_TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kolkata",
});

export const epochToTime = (epoch) =>
  epoch ? IST_TIME.format(new Date(epoch * 1000)) : "";

export const arrivalLabel = (epoch) =>
  epoch
    ? new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }).format(new Date(epoch * 1000))
    : null;

export const fromRow = (row) => ({
  food_preference: row?.food_preference ?? "",
  // Carried, not asked for. The form doesn't collect this, but a write replaces
  // the whole row, so anything already on it has to travel back out untouched
  // rather than be wiped by a save the member didn't mean as a deletion.
  dietary_notes: row?.dietary_notes ?? "",
  travel_mode: row?.travel_mode ?? "",
  arrival_time: epochToTime(row?.arrival_at),
  arrival_note: row?.arrival_note ?? "",
  needs_travel_guidance: !!row?.needs_travel_guidance,
  guidance_note: row?.guidance_note ?? "",
});

// A write replaces the whole row, so every field goes on every save and a blank
// goes as null: clearing an answer has to be expressible.
export const toLogisticsPayload = (form) => ({
  food_preference: orNull(form.food_preference),
  dietary_notes: orNull(form.dietary_notes),
  travel_mode: orNull(form.travel_mode),
  arrival_at: timeToEpoch(form.arrival_time),
  arrival_note: orNull(form.arrival_note),
  needs_travel_guidance: !!form.needs_travel_guidance,
  // The note is only meaningful alongside the ask, so unchecking clears it
  // rather than leaving an orphaned sentence on the row.
  guidance_note: form.needs_travel_guidance ? orNull(form.guidance_note) : null,
});

// One payload aimed at somebody else's row, for the leader saving a team that
// is travelling together. Everything they can reasonably answer on a teammate's
// behalf travels; dietary_notes never does, because an allergy is the one answer
// nobody can give for you — whatever is already on the target's row stays there.
export const copyToMember = (payload, targetRow) => ({
  ...payload,
  dietary_notes: orNull(targetRow?.dietary_notes),
});
