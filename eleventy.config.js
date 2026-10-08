import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import markdownIt from "markdown-it";

export default function (eleventyConfig) {
  // Réécrit automatiquement les liens "/..." quand le site est publié
  // dans un sous-dossier (https://compte.github.io/nom-du-depot/)
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // Fichiers copiés tels quels
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy("src/css");

  // --- Collections -------------------------------------------------------
  eleventyConfig.addCollection("machines", (api) =>
    api.getFilteredByGlob("src/machines/*.md")
      .sort((a, b) => (a.data.ordre ?? 99) - (b.data.ordre ?? 99))
  );

  eleventyConfig.addCollection("tutoriels", (api) =>
    api.getFilteredByGlob("src/tutoriels/*.md")
      .filter((p) => !p.data.brouillon)
      .sort((a, b) => a.data.title.localeCompare(b.data.title, "fr"))
  );

  eleventyConfig.addCollection("ateliers", (api) =>
    api.getFilteredByGlob("src/ateliers/*.md")
      .filter((p) => !p.data.brouillon)
      .sort((a, b) => new Date(b.data.date_atelier) - new Date(a.data.date_atelier))
  );

  eleventyConfig.addCollection("infos", (api) =>
    api.getFilteredByGlob("src/infos/*.md")
      .sort((a, b) => (a.data.ordre ?? 99) - (b.data.ordre ?? 99))
  );

  // --- Filtres -----------------------------------------------------------
  // Date lisible en français : "12 octobre 2026"
  eleventyConfig.addFilter("dateFr", (value) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  });

  // Date machine pour l'attribut <time datetime="">
  eleventyConfig.addFilter("dateIso", (value) =>
    value ? new Date(value).toISOString().slice(0, 10) : ""
  );

  // Tutoriels d'une machine donnée
  eleventyConfig.addFilter("parMachine", (tutos, slug) =>
    (tutos || []).filter((t) => t.data.machine === slug)
  );

  // Retrouve une machine par son identifiant
  eleventyConfig.addFilter("machineParSlug", (machines, slug) =>
    (machines || []).find((m) => m.fileSlug === slug)
  );

  // Tutoriels du plus récent au plus ancien (champ "date_publication").
  // Un tutoriel sans date passe en dernier.
  eleventyConfig.addFilter("plusRecents", (tutos) =>
    [...(tutos || [])].sort((a, b) => {
      const da = a.data.date_publication ? new Date(a.data.date_publication) : 0;
      const db = b.data.date_publication ? new Date(b.data.date_publication) : 0;
      return db - da;
    })
  );

  // Les N premiers éléments
  eleventyConfig.addFilter("limite", (arr, n) => (arr || []).slice(0, n));

  // Transforme un texte markdown (champ "texte" d'une étape) en HTML
  const md = markdownIt({ html: true, linkify: true, typographer: true });
  eleventyConfig.addFilter("md", (content) => (content ? md.render(String(content)) : ""));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // Préfixe fourni par le déploiement GitHub (ex. "/fablab/"), "/" en local
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
