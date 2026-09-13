import { shippingDestinations as fallbackDestinations } from '../data/shipping';
import { supabase } from '../lib/supabase';
import type { ShippingDestination } from '../types';

interface ShippingDestinationRow {
  country_code: string;
  country_name: string;
  cost: number;
  currency: string;
  eta_min_days: number;
  eta_max_days: number;
  customs_note: string;
}

function mapRow(row: ShippingDestinationRow): ShippingDestination {
  return {
    countryCode: row.country_code,
    countryName: row.country_name,
    cost: row.cost,
    currency: row.currency,
    etaMinDays: row.eta_min_days,
    etaMaxDays: row.eta_max_days,
    customsNote: row.customs_note,
  };
}

export async function fetchShippingDestinations(): Promise<ShippingDestination[]> {
  if (!supabase) return fallbackDestinations;

  const { data, error } = await supabase
    .from('shipping_destinations')
    .select('*')
    .eq('is_active', true)
    .order('cost', { ascending: true });

  if (error || !data) {
    console.warn('Supabase fetchShippingDestinations failed, using local list:', error?.message);
    return fallbackDestinations;
  }

  return (data as ShippingDestinationRow[]).map(mapRow);
}
