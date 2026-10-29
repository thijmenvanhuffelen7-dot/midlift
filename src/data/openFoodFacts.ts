export type FoodProduct = { code: string; name: string; brand?: string; kcal100: number; protein100: number };

// Open Food Facts asks apps to identify themselves. Replace the email with your own.
const USER_AGENT = 'Midlift/0.1 (hello@example.com)';

/** Searches Open Food Facts and returns products that have calories and protein per 100 g. */
export async function searchFood(query: string, lang: string): Promise<FoodProduct[]> {
  // Built by hand: React Native's URLSearchParams is incomplete on some versions.
  const params: Record<string, string> = {
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '25',
    lc: lang,
    fields: 'code,product_name,product_name_' + lang + ',brands,nutriments',
  };
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${qs}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`Open Food Facts ${res.status}`);
  const data = (await res.json()) as { products?: any[] };
  return (data.products ?? [])
    .map((p) => {
      const n = p.nutriments ?? {};
      const kcal = Number(n['energy-kcal_100g']);
      const protein = Number(n['proteins_100g']);
      const name = (p[`product_name_${lang}`] || p.product_name || '').trim();
      return {
        code: String(p.code ?? ''),
        name,
        brand: p.brands ? String(p.brands).split(',')[0].trim() : undefined,
        kcal100: kcal,
        protein100: protein,
      };
    })
    .filter((p) => p.name && Number.isFinite(p.kcal100) && Number.isFinite(p.protein100));
}
