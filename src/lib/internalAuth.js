// Internal auth — stores session in localStorage, independent of Base44 auth

const SESSION_KEY = "ez_session";

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export const ROLE_PATHS = {
  agent:      "/AgentDashboard",
  broker:     "/BrokerDashboard",
  buyer:      "/BuyerExperience",
  seller:     "/SellerExperience",
  superadmin: "/SuperAdmin",
};