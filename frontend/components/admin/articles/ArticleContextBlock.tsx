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

      {/* ---------------------------------------
          TOPICS (OBLIGATOIRES)
      ---------------------------------------- */}
      <div>
        <TopicSelector
          values={topics}
          onChange={(values) => onChange({ topics: values })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Au moins un topic est requis pour créer l’article.
        </p>
      </div>

      {/* ---------------------------------------
          SOCIÉTÉS (OPTIONNEL)
      ---------------------------------------- */}
      <CompanySelector
        values={companies}
        onChange={(values) => onChange({ companies: values })}
      />

      {/* ---------------------------------------
          PERSONNES (OPTIONNEL)
      ---------------------------------------- */}
      <PersonSelector
        values={persons}
        onChange={(values) => onChange({ persons: values })}
      />
    </div>
  );
}
