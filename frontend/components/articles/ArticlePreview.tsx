export default function ArticlePreview({ article }) {
  if (!article) return null;

  return (
    <div className="prose prose-gray max-w-none">
      <h1>{article.TITRE}</h1>
      {article.VISUEL_URL && (
        <img
          src={article.VISUEL_URL}
          alt=""
          className="rounded-lg mb-4"
        />
      )}
      <div dangerouslySetInnerHTML={{ __html: article.CONTENU_HTML }} />
    </div>
  );
}
