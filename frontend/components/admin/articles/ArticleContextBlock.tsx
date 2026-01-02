"use client";

import TopicSelector from "@/components/admin/TopicSelector";
import CompanySelector from "@/components/admin/CompanySelector";
import PersonSelector, {
  ArticlePerson,
} from "@/components/admin/PersonSelector";

type Topic = {
  id_topic: string;
  label: string;
};

type Company = {
  id_company: string;
  name: string;
};

type Props = {
  topics: Topic[];
  companies: Company[];
  persons: ArticlePerson[];

  onChange: (data: {
    topics?: Topic[];
    companies?: Company[];
    persons?: ArticlePerson[];
  }) => void;
};

export default function ArticleContextBlock({
  topics,
  companies,
  persons,
  onChange,
}: Props) {
  return (
    <div className="space-y-6 border rounded p-4 bg-white">

      <h2 className="text-lg font-semibold text-ratecard-blue">
        Contexte éditorial
      </h2>

      {/* TOPICS */}
      <TopicSelector
        values={topics}
        onChange={(values: Topic[]) => onChange({ topics: values })}
      />

      {/* SOCIÉTÉS */}
      <CompanySelector
        values={companies}
        onChange={(values: Company[]) => onChange({ companies: values })}
      />

      {/* PERSONNES */}
      <PersonSelector
        values={persons}
        onChange={(values: ArticlePerson[]) => onChange({ persons: values })}
      />
    </div>
  );
}
