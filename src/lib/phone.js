// Arabic-Indic digits (٠١٢…) -> English digits, strips spaces/dashes
export const normalizePhone = (v) =>
  v
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/\D/g, "");

export const isValidPhone = (v) => /^01\d{9}$/.test(v);