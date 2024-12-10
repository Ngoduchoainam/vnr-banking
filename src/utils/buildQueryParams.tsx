import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

export const buildSearchParams = (
  searchTerms: Array<{ Name: string; Value: string }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalParams: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: Record<string, any> = {};

  // Thêm các điều kiện tìm kiếm từ searchTerms
  if (searchTerms.length > 0) {
    searchTerms.forEach((term, index) => {
      params[`searchTerms[${index}].Name`] = term.Name;
      // params[`searchTerms[${index}].Value`] = term.Value;
      if (Array.isArray(term.Value)) {
        params[`searchTerms[${index}].Value`] = term.Value.join(",");
      } else {
        params[`searchTerms[${index}].Value`] = term.Value;
      }
    });
  }

  // Thêm các tham số bổ sung như pageIndex, pageSize, globalTerm
  Object.keys(additionalParams).forEach((key) => {
    if (additionalParams[key] !== undefined) {
      params[key] = additionalParams[key];
    }
  });

  return params;
};

export const parseLabelToNumber = (label: string) => {
  const number = parseFloat(label.replace(/[$.]/g, ""));
  return isNaN(number) ? 0 : number;
};

export const formatCurrencyVN = (value: string): string => {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "");
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(numericValue));
};

export const formatCurrencyUSD = (value: string): string => {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "");
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(numericValue));
};

export const formatDate = (inputDate: string | Date): string => {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const disabledDate = (current: Dayjs | null): boolean => {
  return current ? current.year() > new Date().getFullYear() : false;
};

export const options = [
  {
    value: "1",
    label: "Tháng 1",
  },
  {
    value: "2",
    label: "Tháng 2",
  },
  {
    value: "3",
    label: "Tháng 3",
  },
  {
    value: "4",
    label: "Tháng 4",
  },
  {
    value: "5",
    label: "Tháng 5",
  },
  {
    value: "6",
    label: "Tháng 6",
  },
  {
    value: "7",
    label: "Tháng 7",
  },
  {
    value: "8",
    label: "Tháng 8",
  },
  {
    value: "9",
    label: "Tháng 9",
  },
  {
    value: "10",
    label: "Tháng 10",
  },
  {
    value: "11",
    label: "Tháng 11",
  },
  {
    value: "12",
    label: "Tháng 12",
  },
];

// Disable future dates
export const disabledDateFeature = (current: Dayjs | null): boolean => {
  return current ? current.isAfter(dayjs(), "day") : false;
};

// Disable future hours and minutes
export const disabledTimeFeature = (current: Dayjs | null) => {
  if (current && current.isSame(dayjs(), "day")) {
    return {
      disabledHours: () =>
        Array.from({ length: 24 }, (_, i) => i).filter(
          (hour) => hour > dayjs().hour()
        ),
      disabledMinutes: () =>
        Array.from({ length: 60 }, (_, i) => i).filter(
          (minute) => minute > dayjs().minute()
        ),
      disabledSeconds: () =>
        Array.from({ length: 60 }, (_, i) => i).filter(
          (second) => second > dayjs().second()
        ),
    };
  }
  return {};
};
