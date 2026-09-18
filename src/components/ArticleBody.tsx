import type { ArticleBody as ArticleBodyJson } from "@/types/database";
import ArticleChart from "@/components/ArticleChart";
import { getArticleToc } from "@/lib/article-toc";
import { normalizeDashes } from "@/lib/text";

function InlineText({ text }: { text: string }) {
  const parts = normalizeDashes(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function isValidChart(body: ArticleBodyJson) {
  const chart = body.chart;
  if (!chart) return false;
  if (chart.labels.length < 2 || chart.series.length === 0) return false;
  return chart.series.every((s) => s.values.length === chart.labels.length);
}

export default function ArticleBody({
  body,
  hideTakeaways = false,
}: {
  body: ArticleBodyJson;
  hideTakeaways?: boolean;
}) {
  const toc = getArticleToc(body);
  const sectionIds: Array<string | null> = [];
  let tocCursor = 0;

  for (const section of body.sections) {
    if (section.heading?.trim()) {
      sectionIds.push(toc[tocCursor]?.id ?? null);
      tocCursor += 1;
    } else {
      sectionIds.push(null);
    }
  }

  const takeawaysId = body.takeaways?.length
    ? toc[toc.length - 1]?.id
    : undefined;

  return (
    <div className="article-body">
      {body.lede && (
        <p>
          <InlineText text={body.lede} />
        </p>
      )}

      {isValidChart(body) && body.chart && <ArticleChart chart={body.chart} />}

      {body.sections.map((section, i) => {
        const id = sectionIds[i] ?? undefined;
        const heading = section.heading?.trim();

        return (
          <section key={i}>
            {heading && <h2 id={id}>{normalizeDashes(heading)}</h2>}
            {section.paragraphs.map((p, j) => (
              <p key={j}>
                <InlineText text={p} />
              </p>
            ))}
            {i === 0 && body.pullQuote && (
              <p className="pullquote">
                <InlineText text={body.pullQuote} />
              </p>
            )}
          </section>
        );
      })}

      {!hideTakeaways && body.takeaways && body.takeaways.length > 0 && (
        <div className="keytakeaways" id={takeawaysId}>
          <h4>Key takeaways</h4>
          <ul>
            {body.takeaways.map((t, i) => (
              <li key={i}>
                <InlineText text={t} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
