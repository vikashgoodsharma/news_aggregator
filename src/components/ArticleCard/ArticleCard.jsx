import "./ArticleCard.css";
const ArticleCard = ({ index, title, author, source, date, description }) => {
  return (
    <div key={index} className="card">
      <h2>{title}</h2>
      <p className="meta">
        {author} • {source} • {new Date(date).toLocaleDateString()}
      </p>
      <p>{description}</p>
    </div>
  );
};
export default ArticleCard;
