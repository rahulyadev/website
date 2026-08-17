type JsonLdPrimitive = boolean | null | number | string;
export type JsonLdValue =
  | JsonLdPrimitive
  | { readonly [key: string]: JsonLdValue | undefined }
  | readonly JsonLdValue[];

const unsafeJsonCharacter: Readonly<Record<string, string>> = {
  "&": "\\u0026",
  "<": "\\u003c",
  ">": "\\u003e",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

export function serializeJsonLd(value: JsonLdValue) {
  return JSON.stringify(value).replace(
    /[&<>\u2028\u2029]/g,
    (character) => unsafeJsonCharacter[character] ?? character,
  );
}

export function JsonLd({ data }: { readonly data: JsonLdValue }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}
