export function getDaysInMonth(years, month, mode = "max") {
  if (!years || !years.length) return 0;

  let dayArray = years.map((y) => {
    const yearNum = typeof y === "string" ? parseInt(y, 10) : y;
    return new Date(yearNum, month, 0).getDate();
  });

  if (mode === "max") {
    return Math.max(...dayArray);
  } else {
    return Math.min(...dayArray);
  }
}