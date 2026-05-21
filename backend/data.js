// Color palette for roulette wheel
const rouletteColors = [
  '#10b981', '#fbbf24', '#3b82f6', '#8b5cf6',
  '#14b8a6', '#f97316', '#06b6d4', '#ec4899',
  '#059669', '#d97706', '#2563eb', '#7c3aed',
  '#0d9488', '#ea580c', '#0891b2', '#db2777',
  '#047857', '#b45309', '#1d4ed8', '#6d28d9'
];

// Dummy data
const members = [
  { id: 1, name: "Abebe Bekele", email: "abebe@example.com", phone: "+251911223344", joinedAt: "2024-01-15", status: "active", paymentsPaid: 1, color: rouletteColors[0] },
  { id: 2, name: "Sara Tesfaye", email: "sara@example.com", phone: "+251922334455", joinedAt: "2024-02-01", status: "active", paymentsPaid: 1, color: rouletteColors[1] },
  { id: 3, name: "Daniel Mekonnen", email: "daniel@example.com", phone: "+251933445566", joinedAt: "2024-01-20", status: "active", paymentsPaid: 1, color: rouletteColors[2] },
  { id: 4, name: "Hana Solomon", email: "hana@example.com", phone: "+251944556677", joinedAt: "2024-03-10", status: "active", paymentsPaid: 1, color: rouletteColors[3] },
  { id: 5, name: "Yonas Abebe", email: "yonas@example.com", phone: "+251955667788", joinedAt: "2024-02-15", status: "active", paymentsPaid: 1, color: rouletteColors[4] },
  { id: 6, name: "Marta Kebede", email: "marta@example.com", phone: "+251966778899", joinedAt: "2024-01-25", status: "active", paymentsPaid: 1, color: rouletteColors[5] },
];

const contributions = [
  { id: 1, memberId: 1, memberName: "Abebe Bekele", round: 1, amount: 1000, paidAt: "2024-06-15", status: "paid" },
  { id: 2, memberId: 2, memberName: "Sara Tesfaye", round: 1, amount: 1000, paidAt: "2024-06-14", status: "paid" },
  { id: 3, memberId: 3, memberName: "Daniel Mekonnen", round: 1, amount: 1000, paidAt: "2024-06-14", status: "paid" },
  { id: 4, memberId: 4, memberName: "Hana Solomon", round: 1, amount: 1000, paidAt: "2024-06-16", status: "paid" },
  { id: 5, memberId: 5, memberName: "Yonas Abebe", round: 1, amount: 1000, paidAt: "2024-06-16", status: "paid" },
  { id: 6, memberId: 6, memberName: "Marta Kebede", round: 1, amount: 1000, paidAt: "2024-06-13", status: "paid" },
];

const winners = [];

// Equb draw state: tracks the order of winners for the current cycle
const drawOrder = members.map(m => m.id); // Initial order: all members in order
const currentWinnerIndex = 0; // Next winner index in drawOrder

const chartData = [
  { month: "Jun", contributions: 6000 },
];

const notifications = [
  { id: 1, title: "Welcome", message: "Welcome to Equb Management System", time: "1 day ago", read: true },
];

module.exports = {
  members,
  contributions,
  winners,
  chartData,
  notifications,
  drawOrder,
  currentWinnerIndex,
};
