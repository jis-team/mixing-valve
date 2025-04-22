// ./src/utils/calcStats.js

export function computeMonthlyStats(rawData, measureColumns, selectedYears, calcMode) {
  const result = {};
  selectedYears.forEach((yearStr) => {
    // 해당 연도만 필터
    const filtered = rawData.filter((row) => {
      const y = row.datetime?.slice(0, 4);
      return y === yearStr;
    });

    // 월별로 값을 모을 객체
    const monthlyObj = {};
    for (let m = 1; m <= 12; m++) {
      monthlyObj[m] = {};
      measureColumns.forEach((col) => {
        monthlyObj[m][col] = [];
      });
    }

    // 월별 누적
    filtered.forEach((item) => {
      const dObj = new Date(item.datetime);
      const m = dObj.getMonth() + 1;
      measureColumns.forEach((col) => {
        const val = item[col];
        if (typeof val === "number") {
          monthlyObj[m][col].push(val);
        }
      });
    });

    // 결과
    const yearRes = {};
    measureColumns.forEach((col) => {
      yearRes[col] = Array(12).fill(null);
    });

    for (let m = 1; m <= 12; m++) {
      measureColumns.forEach((col) => {
        const arr = monthlyObj[m][col];
        if (arr.length) {
          const sum = arr.reduce((a, b) => a + b, 0);
          yearRes[col][m - 1] = calcMode === "sum" ? sum : sum / arr.length;
        }
      });
    }
    result[yearStr] = yearRes;
  });
  return result;
}

export function computeDailyStats(rawData, measureColumns, selectedYears, month, calcMode) {
  const result = {};
  if (!month) return result;

  selectedYears.forEach((yearStr) => {
    const filtered = rawData.filter((item) => {
      const dObj = new Date(item.datetime);
      return (
        String(dObj.getFullYear()) === yearStr &&
        dObj.getMonth() + 1 === month
      );
    });

    const dailyObj = {};
    for (let d = 1; d <= 31; d++) {
      dailyObj[d] = {};
      measureColumns.forEach((col) => {
        dailyObj[d][col] = [];
      });
    }

    filtered.forEach((item) => {
      const dObj = new Date(item.datetime);
      const dd = dObj.getDate();
      measureColumns.forEach((col) => {
        if (typeof item[col] === "number") {
          dailyObj[dd][col].push(item[col]);
        }
      });
    });

    const yearRes = {};
    measureColumns.forEach((col) => {
      yearRes[col] = Array(31).fill(null);
    });

    for (let d = 1; d <= 31; d++) {
      measureColumns.forEach((col) => {
        const arr = dailyObj[d][col];
        if (arr.length) {
          const sum = arr.reduce((a, b) => a + b, 0);
          yearRes[col][d - 1] = calcMode === "sum" ? sum : sum / arr.length;
        }
      });
    }

    result[yearStr] = yearRes;
  });
  return result;
}

export function computeHourlyStats(rawData, measureColumns, selectedYears, month, day, calcMode) {
  const result = {};
  if (!month || !day) return result;

  selectedYears.forEach((yearStr) => {
    const filtered = rawData.filter((item) => {
      const dObj = new Date(item.datetime);
      return (
        String(dObj.getFullYear()) === yearStr &&
        dObj.getMonth() + 1 === month &&
        dObj.getDate() === day
      );
    });

    const hourlyObj = {};
    for (let h = 0; h < 24; h++) {
      hourlyObj[h] = {};
      measureColumns.forEach((col) => {
        hourlyObj[h][col] = [];
      });
    }

    filtered.forEach((item) => {
      const dObj = new Date(item.datetime);
      const hh = dObj.getHours();
      measureColumns.forEach((col) => {
        if (typeof item[col] === "number") {
          hourlyObj[hh][col].push(item[col]);
        }
      });
    });

    const yearRes = {};
    measureColumns.forEach((col) => {
      yearRes[col] = Array(24).fill(null);
    });

    for (let h = 0; h < 24; h++) {
      measureColumns.forEach((col) => {
        const arr = hourlyObj[h][col];
        if (arr.length) {
          const sum = arr.reduce((a, b) => a + b, 0);
          yearRes[col][h] = calcMode === "sum" ? sum : sum / arr.length;
        }
      });
    }
    result[yearStr] = yearRes;
  });
  return result;
}

export function computeYearMonthDayStats(dataArr, selectedDate, calcMode) {
  let yearSum = 0,
    yearCount = 0;
  let monthSum = 0,
    monthCount = 0;
  let daySum = 0,
    dayCount = 0;

  const ySel = selectedDate.year();
  const mSel = selectedDate.month() + 1;
  const dSel = selectedDate.date();

  dataArr.forEach((item) => {
    const dObj = new Date(item.datetime);
    if (!item.datetime || isNaN(dObj.getTime())) return;

    const yy = dObj.getFullYear();
    const mm = dObj.getMonth() + 1;
    const dd = dObj.getDate();
    if (yy === ySel) {
      yearSum += item.value;
      yearCount++;
      if (mm === mSel) {
        monthSum += item.value;
        monthCount++;
        if (dd === dSel) {
          daySum += item.value;
          dayCount++;
        }
      }
    }
  });

  const yearVal =
    yearCount === 0 ? null : calcMode === "sum" ? yearSum : yearSum / yearCount;
  const monthVal =
    monthCount === 0
      ? null
      : calcMode === "sum"
      ? monthSum
      : monthSum / monthCount;
  const dayVal =
    dayCount === 0 ? null : calcMode === "sum" ? daySum : daySum / dayCount;

  return { yearVal, monthVal, dayVal };
}
