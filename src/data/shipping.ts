import type { ShippingDestination } from '../types';

/** Mirrors supabase/seed.sql — used when Supabase isn't configured. */
export const shippingDestinations: ShippingDestination[] = [
  {
    countryCode: 'KZ',
    countryName: 'Казахстан',
    cost: 4900,
    currency: '₸',
    etaMinDays: 7,
    etaMaxDays: 12,
    customsNote:
      'Для физлиц действует порог беспошлинного ввоза для товаров личного пользования (уточняйте актуальный лимит на сайте ЕЭК/КГД РК) — при превышении взимается пошлина и НДС.',
  },
  {
    countryCode: 'RU',
    countryName: 'Россия',
    cost: 6900,
    currency: '₸',
    etaMinDays: 10,
    etaMaxDays: 16,
    customsNote:
      'Возможны таможенные пошлины при превышении лимита беспошлинного ввоза для физлиц — уточняйте актуальные пороги на сайте ФТС.',
  },
  {
    countryCode: 'KG',
    countryName: 'Кыргызстан',
    cost: 5900,
    currency: '₸',
    etaMinDays: 9,
    etaMaxDays: 15,
    customsNote: 'Как член ЕАЭС применяются единые пороги беспошлинного ввоза ЕАЭС для физлиц.',
  },
  {
    countryCode: 'UZ',
    countryName: 'Узбекистан',
    cost: 7900,
    currency: '₸',
    etaMinDays: 12,
    etaMaxDays: 18,
    customsNote:
      'Узбекистан не входит в ЕАЭС — таможенное оформление и пошлины рассчитываются по национальному законодательству.',
  },
  {
    countryCode: 'DE',
    countryName: 'Германия (пример: остальной мир)',
    cost: 15900,
    currency: '₸',
    etaMinDays: 15,
    etaMaxDays: 25,
    customsNote:
      'Пошлины и НДС страны получателя оплачиваются покупателем при получении в соответствии с местным законодательством.',
  },
];
