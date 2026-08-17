// ============================================
// main.js - SHARED UTILITIES
// ============================================

export const API_BASE = 'http://127.0.0.1:3000'; 

// Shared Color Palette
export const COLORS = {
  primary: "#6366f1",
  primaryLight: "#8b5cf6",
  primaryDark: "#4f46e5",
  accent: "#14b8a6",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  avatar: ["#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f43f5e", "#10b981"],
};

// Utility: Format currency to Rands
export function toRand(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "R0";
  return "R" + amount.toLocaleString("en-ZA", { maximumFractionDigits: 0 });
}

// Utility: Get initials from name
export function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

// Utility: Show Toast Notification (NO ICONS)
export function showNotification(message, type = "success") {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = "notification";
  
  const colors = { success: "#10b981", error: "#ef4444", warning: "#f59e0b", info: "#6366f1" };
  
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 16px 24px;
    background: ${colors[type] || colors.success}; color: white;
    border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    z-index: 100000; font-weight: 600; font-size: 0.95rem;
    animation: slideInRight 0.3s ease; max-width: 400px;
    border: 1px solid rgba(255,255,255,0.08);
    font-family: 'Inter', system-ui, sans-serif;
  `;
  
  // ✅ FIX: No icons, just plain text
  notification.innerHTML = message;
  
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}