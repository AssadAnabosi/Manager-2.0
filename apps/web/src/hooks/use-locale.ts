import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import { ar, enGB } from "date-fns/locale";

import { DATE_FORMAT } from "@/lib/constants";
import type { LanguageType } from "@/lib/types";

export type LocaleInfo = {
  lang: LanguageType;
  dir: "ltr" | "rtl";
  /** date-fns locale for formatting and the calendar. */
  dateLocale: Locale;
  /** Intl locale for numbers and money; always Latin digits. */
  numberLocale: string;
};

const LOCALES: Record<LanguageType, Omit<LocaleInfo, "lang">> = {
  en: { dir: "ltr", dateLocale: enGB, numberLocale: "en-GB" },
  ar: { dir: "rtl", dateLocale: ar, numberLocale: "ar-AE-u-nu-latn" },
};

/** The active language and what derives from it; re-renders when it changes. */
export function useLocale(): LocaleInfo {
  const { i18n } = useTranslation();
  const lang: LanguageType = i18n.resolvedLanguage === "ar" ? "ar" : "en";
  return useMemo(() => ({ lang, ...LOCALES[lang] }), [lang]);
}

type DateInput = Date | string | number;

const toDate = (value: DateInput) =>
  value instanceof Date ? value : new Date(value);

/** Date, number and money formatting in the active language. */
export function useFormatters() {
  const { lang, dateLocale, numberLocale } = useLocale();
  return useMemo(() => {
    const currency = new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: "ILS",
    });
    const signed = new Intl.NumberFormat(numberLocale, {
      signDisplay: "always",
    });
    const money = (amount: unknown) =>
      currency.format(typeof amount === "number" ? amount : 0);
    return {
      lang,
      /** `₪1,250.00` */
      currency: money,
      /** `−₪120.00` for money spent, `+₪500.00` for money received. */
      signedCurrency: (type: "expense" | "income", amount: number) =>
        `${type === "expense" ? "−" : "+"}${money(amount)}`,
      /** `+3.5` / `-2` */
      number: (value: unknown) =>
        signed.format(typeof value === "number" ? value : 0),
      /** Formats with date-fns in the active language; defaults to `Tuesday, 12/11/2026`. */
      date: (value: DateInput, pattern: string = DATE_FORMAT) =>
        format(toDate(value), pattern, { locale: dateLocale }),
    };
  }, [lang, dateLocale, numberLocale]);
}
