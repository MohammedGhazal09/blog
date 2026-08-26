export type SectionRecord = {
  label: string;
  description: string;
  slug: string;
  order: number;
};

export type AuthorRecord = {
  name: string;
};

export const sectionRegistry = {
  refutations: {
    label: "الردود والشبهات",
    description: "ردود موثقة على الشبهات الفكرية والدينية.",
    slug: "الردود-والشبهات",
    order: 1,
  },
  generalIssues: {
    label: "القضايا العامة",
    description: "مقالات وتعليقات في القضايا العامة ذات الاهتمام المشترك.",
    slug: "القضايا-العامة",
    order: 2,
  },
  scholarship: {
    label: "القسم العلمي",
    description: "دروس مرتبة في العلوم الشرعية والمعارف الإسلامية.",
    slug: "القسم-العلمي",
    order: 3,
  },
} as const satisfies Readonly<Record<string, SectionRecord>>;

export const authorRegistry = {
  ahmedElMangawy: {
    name: "أحمد المنجاوي",
  },
} as const satisfies Readonly<Record<string, AuthorRecord>>;

export type SectionKey = keyof typeof sectionRegistry;
export type AuthorKey = keyof typeof authorRegistry;
