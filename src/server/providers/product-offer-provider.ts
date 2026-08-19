import { createHash } from "node:crypto";
import { z } from "zod";
import { DomainError, type ProductNeed } from "@/domain/obria";
import {
  deduplicateProductOffers,
  matchRequiredTermGroups,
  type ProductOffer,
} from "@/domain/product-research";

export const LIVE_PRODUCT_SOURCE_NOTICE_PT_BR =
  "Preços anunciados na Shopee no momento da pesquisa; variam por opção, frete, estoque e promoção. Não são orçamento nem comprovante de compra.";
export const REPLAY_PRODUCT_SOURCE_NOTICE_PT_BR =
  "DADOS DE REPLAY — NÃO SÃO PREÇOS ATUAIS.";

export interface ProductOfferProvider {
  readonly mode: "LIVE" | "REPLAY";
  search(need: ProductNeed): Promise<ProductOffer[]>;
}

const SHOPEE_GRAPHQL_URL = "https://open-api.affiliate.shopee.com.br/graphql";
const PRODUCT_OFFER_QUERY =
  "query ProductOfferV2($keyword: String, $sortType: Int, $page: Int, $limit: Int) { productOfferV2(keyword: $keyword, sortType: $sortType, page: $page, limit: $limit) { nodes { itemId productName productLink offerLink imageUrl price priceMin priceMax shopId shopName sales ratingStar periodStartTime periodEndTime } } }";

const Int64Schema = z.union([
  z.string().regex(/^\d+$/),
  z.number().int().nonnegative(),
]);
const DecimalSchema = z.union([z.string().min(1), z.number().finite()]);
const ExternalOfferSchema = z.object({
  itemId: Int64Schema,
  productName: z.string().min(1),
  productLink: z.string().min(1),
  offerLink: z.string().min(1),
  imageUrl: z.string().min(1).nullish(),
  price: DecimalSchema,
  priceMin: DecimalSchema,
  priceMax: DecimalSchema,
  shopId: Int64Schema,
  shopName: z.string().min(1),
  sales: Int64Schema,
  ratingStar: DecimalSchema,
  periodStartTime: Int64Schema,
  periodEndTime: Int64Schema,
});
const GraphqlResponseSchema = z.object({
  data: z
    .object({
      productOfferV2: z.object({ nodes: z.array(ExternalOfferSchema) }),
    })
    .nullish(),
  errors: z.array(z.unknown()).optional(),
});

type ExternalOffer = z.infer<typeof ExternalOfferSchema>;

type ReplayFixture = {
  catalogKey: ProductNeed["catalogKey"];
  offerId: string;
  productName: string;
  priceCents: number;
  sales: number;
  rating: number;
};

const REPLAY_PERIOD_START = "2026-08-01T00:00:00.000Z";
const REPLAY_PERIOD_END = "2026-12-31T23:59:59.999Z";
const REPLAY_FIXTURES: readonly ReplayFixture[] = [
  {
    catalogKey: "LIGHT_POINT",
    offerId: "replay-light-low",
    productName: "Luminária LED 9W 720lm 2700K",
    priceCents: 7_990,
    sales: 184,
    rating: 4.7,
  },
  {
    catalogKey: "LIGHT_POINT",
    offerId: "replay-light-efficient",
    productName: "Luminária LED 8W 800lm 2700K",
    priceCents: 10_990,
    sales: 121,
    rating: 4.8,
  },
  {
    catalogKey: "RUG",
    offerId: "replay-rug-low",
    productName: "Tapete para sala 200x150 poliéster",
    priceCents: 14_990,
    sales: 96,
    rating: 4.6,
  },
  {
    catalogKey: "RUG",
    offerId: "replay-rug-efficient",
    productName: "Tapete para sala 200x150 lavável",
    priceCents: 21_990,
    sales: 78,
    rating: 4.8,
  },
  {
    catalogKey: "RUG",
    offerId: "replay-rug-sustainable",
    productName: "Tapete para sala 200x150 material reciclado",
    priceCents: 26_990,
    sales: 42,
    rating: 4.9,
  },
  {
    catalogKey: "SIDE_TABLE",
    offerId: "replay-table-low",
    productName: "Mesa lateral de apoio MDF",
    priceCents: 8_990,
    sales: 155,
    rating: 4.5,
  },
  {
    catalogKey: "SIDE_TABLE",
    offerId: "replay-table-efficient",
    productName: "Mesa lateral dobrável com armazenamento",
    priceCents: 14_990,
    sales: 88,
    rating: 4.7,
  },
  {
    catalogKey: "SIDE_TABLE",
    offerId: "replay-table-sustainable",
    productName: "Mesa lateral madeira certificada FSC",
    priceCents: 22_990,
    sales: 37,
    rating: 4.9,
  },
];

function sourceError(): DomainError {
  return new DomainError(
    "PRODUCT_SOURCE_ERROR",
    "A fonte de produtos retornou dados inválidos ou indisponíveis",
    502,
  );
}

function unavailableError(): DomainError {
  return new DomainError(
    "PRODUCT_PROVIDER_UNAVAILABLE",
    "Credenciais da Shopee ausentes; o provedor de produtos está indisponível",
    503,
  );
}

function stringifyInt64(value: string | number): string {
  if (typeof value === "number" && !Number.isSafeInteger(value)) {
    throw new Error("Int64 numérico fora do intervalo seguro");
  }
  return String(value);
}

function parseNonNegativeInteger(value: string | number): number {
  const raw = stringifyInt64(value);
  const parsed = BigInt(raw);
  if (parsed > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Inteiro fora do intervalo seguro");
  }
  return Number(parsed);
}

function parseBrlCents(value: string | number): number {
  let raw = typeof value === "number" ? String(value) : value.trim();
  raw = raw.replace(/^R\$\s*/i, "").replace(/[\s\u00a0]/g, "");

  let canonical: string;
  if (raw.includes(",")) {
    if (!/^\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?$|^\d+(?:,\d{1,2})?$/.test(raw)) {
      throw new Error("Preço BRL inválido");
    }
    canonical = raw.replace(/\./g, "").replace(",", ".");
  } else {
    if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
      throw new Error("Preço decimal inválido");
    }
    canonical = raw;
  }

  const [whole, fraction = ""] = canonical.split(".");
  const wholeUnits = Number(whole);
  const fractionalCents = Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(wholeUnits) || wholeUnits > Math.floor((Number.MAX_SAFE_INTEGER - fractionalCents) / 100)) {
    throw new Error("Preço fora do intervalo seguro");
  }
  return wholeUnits * 100 + fractionalCents;
}

function parseRating(value: string | number): number {
  const rating = Number(value);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    throw new Error("Avaliação inválida");
  }
  return rating;
}

function parseUnixSeconds(value: string | number): number {
  const raw = stringifyInt64(value);
  const milliseconds = BigInt(raw) * 1_000n;
  if (milliseconds > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Período fora do intervalo seguro");
  }
  const parsed = Number(milliseconds);
  if (!Number.isFinite(new Date(parsed).getTime())) {
    throw new Error("Período inválido");
  }
  return parsed;
}

function isShopeeHttpsUrl(value: string): boolean {
  const parsed = new URL(value);
  return (
    parsed.protocol === "https:" &&
    (parsed.hostname === "shopee.com.br" ||
      parsed.hostname.endsWith(".shopee.com.br"))
  );
}

function toProductOffer(
  external: ExternalOffer,
  need: ProductNeed,
  collectedAt: string,
  activeAtMs: number,
): ProductOffer | null {
  const productUrlValid = isShopeeHttpsUrl(external.productLink);
  const offerUrlValid = isShopeeHttpsUrl(external.offerLink);
  const imageUrlValid =
    external.imageUrl == null || isShopeeHttpsUrl(external.imageUrl);
  if (!productUrlValid || !offerUrlValid || !imageUrlValid) return null;

  const price = parseBrlCents(external.price);
  const low = parseBrlCents(external.priceMin);
  const high = parseBrlCents(external.priceMax);
  if (price <= 0 || low <= 0 || high <= 0) return null;
  if (high < low || price < low || price > high) {
    throw new Error("Faixa de preço inválida");
  }

  const periodStartMs = parseUnixSeconds(external.periodStartTime);
  const periodEndMs = parseUnixSeconds(external.periodEndTime);
  if (periodEndMs < periodStartMs) throw new Error("Período invertido");
  if (activeAtMs < periodStartMs || activeAtMs > periodEndMs) return null;

  const itemId = stringifyInt64(external.itemId);
  const shopId = stringifyInt64(external.shopId);
  const { matchedTerms } = matchRequiredTermGroups(
    external.productName,
    need.requiredTermGroups,
  );

  return {
    offerId: `shopee-${shopId}-${itemId}`,
    provider: "SHOPEE_AFFILIATE",
    itemId,
    shopId,
    shopName: external.shopName,
    productName: external.productName,
    productUrl: external.productLink,
    offerUrl: external.offerLink,
    ...(external.imageUrl == null ? {} : { imageUrl: external.imageUrl }),
    unitPriceCents: { low, high },
    sales: parseNonNegativeInteger(external.sales),
    rating: parseRating(external.ratingStar),
    periodStartAt: new Date(periodStartMs).toISOString(),
    periodEndAt: new Date(periodEndMs).toISOString(),
    collectedAt,
    matchedTerms,
  };
}

export class ReplayProductOfferProvider implements ProductOfferProvider {
  readonly mode = "REPLAY" as const;

  async search(need: ProductNeed): Promise<ProductOffer[]> {
    return REPLAY_FIXTURES.filter(
      (fixture) => fixture.catalogKey === need.catalogKey,
    ).map((fixture) => {
      const { matchedTerms } = matchRequiredTermGroups(
        fixture.productName,
        need.requiredTermGroups,
      );
      const url = `https://shopee.com.br/replay/${fixture.offerId}`;
      return {
        offerId: fixture.offerId,
        provider: "REPLAY",
        itemId: fixture.offerId,
        shopId: "replay-shop",
        shopName: "Loja de demonstração — replay",
        productName: fixture.productName,
        productUrl: url,
        offerUrl: `${url}/oferta`,
        unitPriceCents: {
          low: fixture.priceCents,
          high: fixture.priceCents,
        },
        sales: fixture.sales,
        rating: fixture.rating,
        periodStartAt: REPLAY_PERIOD_START,
        periodEndAt: REPLAY_PERIOD_END,
        collectedAt: REPLAY_PERIOD_START,
        matchedTerms,
      } satisfies ProductOffer;
    });
  }
}

export class ShopeeAffiliateProductOfferProvider
  implements ProductOfferProvider
{
  readonly mode = "LIVE" as const;
  private readonly appId: string;
  private readonly secret: string;

  constructor() {
    this.appId = process.env.SHOPEE_AFFILIATE_APP_ID?.trim() ?? "";
    this.secret = process.env.SHOPEE_AFFILIATE_SECRET?.trim() ?? "";
    if (!this.appId || !this.secret) throw unavailableError();
  }

  private async fetchBySort(
    need: ProductNeed,
    sortType: 1 | 4,
    collectedAt: string,
    activeAtMs: number,
  ): Promise<ProductOffer[]> {
    const payload = JSON.stringify({
      query: PRODUCT_OFFER_QUERY,
      variables: {
        keyword: need.searchQuery,
        sortType,
        page: 1,
        limit: 20,
      },
    });
    const unixSeconds = Math.floor(Date.now() / 1_000);
    const signature = createHash("sha256")
      .update(`${this.appId}${unixSeconds}${payload}${this.secret}`, "utf8")
      .digest("hex");
    const response = await fetch(SHOPEE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `SHA256 Credential=${this.appId}, Timestamp=${unixSeconds}, Signature=${signature}`,
        "Content-Type": "application/json",
      },
      body: payload,
    });
    if (!response.ok) throw sourceError();

    const parsed = GraphqlResponseSchema.safeParse(await response.json());
    if (
      !parsed.success ||
      (parsed.data.errors?.length ?? 0) > 0 ||
      !parsed.data.data
    ) {
      throw sourceError();
    }

    const offers: ProductOffer[] = [];
    for (const external of parsed.data.data.productOfferV2.nodes) {
      const offer = toProductOffer(external, need, collectedAt, activeAtMs);
      if (offer) offers.push(offer);
    }
    return offers;
  }

  async search(need: ProductNeed): Promise<ProductOffer[]> {
    const activeAtMs = Date.now();
    const collectedAt = new Date(activeAtMs).toISOString();
    try {
      const [relevant, lowestPrice] = await Promise.all([
        this.fetchBySort(need, 1, collectedAt, activeAtMs),
        this.fetchBySort(need, 4, collectedAt, activeAtMs),
      ]);
      return deduplicateProductOffers([...relevant, ...lowestPrice]);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sourceError();
    }
  }
}

export function getProductOfferProvider(): ProductOfferProvider {
  const provider = process.env.OBRIA_PRODUCT_PROVIDER;
  if (provider === "replay") return new ReplayProductOfferProvider();
  if (provider === "shopee") return new ShopeeAffiliateProductOfferProvider();
  throw unavailableError();
}
