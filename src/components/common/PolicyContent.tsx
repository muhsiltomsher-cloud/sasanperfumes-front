type BilingualValue = {
  en?: string;
  ar?: string;
};

type PolicyItem = {
  title?: BilingualValue;
  content?: BilingualValue;
  desc?: BilingualValue;
  text?: BilingualValue;
  location?: BilingualValue;
  cost?: BilingualValue;
  delivery?: BilingualValue;
};

type PolicyContentProps = {
  data: Record<string, unknown> | null;
  locale: string;
  sectionKeys?: string[];
  featureKeys?: string[];
  listGroups?: Array<{ key: string; title: string }>;
  ratesKey?: string;
};

function pick(value: unknown, locale: string): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const field = value as BilingualValue;
  return locale === "ar" ? field.ar || field.en || "" : field.en || field.ar || "";
}

function getItems(data: Record<string, unknown> | null, key: string): PolicyItem[] {
  const value = data?.[key];
  return Array.isArray(value) ? (value as PolicyItem[]) : [];
}

export function PolicyContent({
  data,
  locale,
  sectionKeys = [],
  featureKeys = [],
  listGroups = [],
  ratesKey,
}: PolicyContentProps) {
  const sections = sectionKeys.flatMap((key) => getItems(data, key));
  const featureGroups = featureKeys
    .map((key) => ({ key, items: getItems(data, key) }))
    .filter((group) => group.items.length > 0);
  const rates = ratesKey ? getItems(data, ratesKey) : [];

  if (
    sections.length === 0 &&
    featureGroups.length === 0 &&
    listGroups.every((group) => getItems(data, group.key).length === 0) &&
    rates.length === 0
  ) {
    return null;
  }

  return (
    <div className="space-y-10">
      {sections.length > 0 && (
        <div className="space-y-8">
          {sections.map((section, index) => {
            const title = pick(section.title, locale);
            const body = pick(section.content, locale) || pick(section.desc, locale) || pick(section.text, locale);
            if (!title && !body) return null;

            return (
              <section key={`${title}-${index}`} className="border-b border-[#e7ded7] pb-8 last:border-b-0">
                {title && <h2 className="mb-3 text-2xl font-light text-brand-primary">{title}</h2>}
                {body && <p className="text-sm leading-7 text-brand-primary/75">{body}</p>}
              </section>
            );
          })}
        </div>
      )}

      {featureGroups.map((group) => (
        <div key={group.key} className="grid gap-4 md:grid-cols-3">
          {group.items.map((item, index) => {
            const title = pick(item.title, locale);
            const body = pick(item.desc, locale) || pick(item.content, locale);
            if (!title && !body) return null;

            return (
              <div key={`${group.key}-${index}`} className="rounded-lg border border-[#e7ded7] p-5">
                {title && <h3 className="mb-2 text-base font-normal text-brand-primary">{title}</h3>}
                {body && <p className="text-sm leading-6 text-brand-primary/70">{body}</p>}
              </div>
            );
          })}
        </div>
      ))}

      {listGroups.map((group) => {
        const items = getItems(data, group.key);
        if (items.length === 0) return null;

        return (
          <section key={group.key}>
            <h2 className="mb-4 text-2xl font-light text-brand-primary">{group.title}</h2>
            <ul className="space-y-3">
              {items.map((item, index) => {
                const text = pick(item.text, locale) || pick(item.title, locale);
                if (!text) return null;

                return (
                  <li key={`${group.key}-${index}`} className="border-b border-[#e7ded7] pb-3 text-sm text-brand-primary/75">
                    {text}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {rates.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {rates.map((rate, index) => (
                <tr key={`rate-${index}`} className="border-b border-[#e7ded7]">
                  <td className="py-3 pr-4 text-brand-primary">{pick(rate.location, locale)}</td>
                  <td className="py-3 pr-4 text-brand-primary/70">{pick(rate.cost, locale)}</td>
                  <td className="py-3 text-brand-primary/70">{pick(rate.delivery, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
