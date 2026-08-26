// Format angka jadi "Rp 1.499.000"
export const formatCurrency = (value) => {
  const number = Number(value) || 0;

  return `Rp ${number.toLocaleString("id-ID")}`;
};

// Format tanggal jadi "24 Mei 2024"
export const formatDate = (isoString) => {
  if (!isoString) return "-";

  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Format tanggal + jam jadi "24 Mei 2024, 14:30"
export const formatDateTime = (isoString) => {
  if (!isoString) return "-";

  const date = new Date(isoString);

  const datePart = formatDate(isoString);
  const timePart = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart}, ${timePart}`;
};
