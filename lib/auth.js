"use client";

const SESSION_KEY = "auth_session";

export async function signupUser(values) {
  const response = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const data = await response.json();
  if (data.ok && data.user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
  }

  return data;
}

export async function signinUser(values) {
  const response = await fetch("/api/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const data = await response.json();
  if (data.ok && data.user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
  }

  return data;
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
