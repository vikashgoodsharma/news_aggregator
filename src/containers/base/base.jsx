import React, { useState, useEffect } from "react";
import "./base.css";
import { apiKeys } from "../../constants";
import { formatToNYTDate } from "../../utils";
import ArticleCard from "../../components/ArticleCard/ArticleCard";

function Base() {
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("nyt");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      let url = "";
      if (filterSource === "newsapi") {
        url = `https://newsapi.org/v2/everything?q=${
          search || "all"
        }&from=${filterDate}&sortBy=publishedAt&pageSize=10&apiKey=${
          apiKeys.newsapi
        }`;
      } else if (filterSource === "guardian") {
        url = filterDate
          ? `https://content.guardianapis.com/search?q=${search}&from-date=${filterDate}&api-key=${apiKeys.guardian}`
          : `https://content.guardianapis.com/search?q=${search}&api-key=${apiKeys.guardian}`;
      } else if (filterSource === "nyt") {
        url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${search}&begin_date=${formatToNYTDate(
          filterDate || "20200101"
        )}&api-key=${apiKeys.nyt}`;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();
        let fetchedArticles = [];
        let fetchedCategories = [];

        if (filterSource === "newsapi") {
          fetchedArticles = data.articles.map((article) => ({
            title: article.title,
            author: article.author,
            source: article.source.name,
            category: article.source.name,
            date: article.publishedAt,
            description: article.description,
          }));
        } else if (filterSource === "guardian") {
          fetchedArticles = data.response.results.map((article) => ({
            title: article.webTitle,
            author: "Unknown",
            source: "The Guardian",
            category: article.sectionName || "General",
            date: article.webPublicationDate,
            description: article.webTitle,
          }));
          fetchedCategories = data.response.results
            .map((article) => article.sectionName)
            .filter(Boolean);
        } else if (filterSource === "nyt") {
          fetchedArticles = data.response.docs.map((article) => ({
            title: article.headline.main,
            author: article.byline?.original || "Unknown",
            source: "NY Times",
            category: article.news_desk || "General",
            date: article.pub_date,
            description: article.snippet,
          }));
          fetchedCategories = data.response.docs
            .map((article) => article.news_desk)
            .filter(Boolean);
        }

        const filtered = fetchedArticles.filter((article) => {
          return (
            (!filterCategory ||
              article.category
                ?.toLowerCase()
                .includes(filterCategory.toLowerCase())) &&
            (!filterAuthor ||
              article.author
                ?.toLowerCase()
                .includes(filterAuthor.toLowerCase())) &&
            (!filterDate || article.date?.startsWith(filterDate))
          );
        });

        setArticles(filtered);
        setCategories([...new Set(fetchedCategories)]);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      }
    };

    fetchArticles();
  }, [search, filterSource, filterCategory, filterAuthor, filterDate]);

  return (
    <div className="app">
      <header className="header">News Aggregator</header>

      <div className="controls">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filterSource}
          onChange={(e) => {
            setFilterSource(e.target.value);
            setFilterCategory("");
            setFilterDate("");
          }}
        >
          <option value="newsapi">NewsAPI</option>
          <option value="guardian">The Guardian</option>
          <option value="nyt">NY Times</option>
        </select>

        {filterSource !== "newsapi" && categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}

        {filterSource !== "guardian" && (
          <input
            type="text"
            placeholder="Filter by author..."
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
          />
        )}

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      <div className="articles">
        {articles.map((article, index) => (
          <ArticleCard
            index={index}
            title={article.title}
            author={article.author}
            source={article.source}
            date={article.date}
            description={article.description}
          />
        ))}
      </div>
    </div>
  );
}

export default Base;
