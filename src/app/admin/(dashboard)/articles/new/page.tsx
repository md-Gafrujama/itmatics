import { createClient } from "@/lib/supabase/server";
import { IT_TOPIC_SLUGS, sortTopicsByNavOrder } from "@/lib/topic-config";
import { createArticle } from "@/lib/actions/articles";
import ArticleForm from "@/components/admin/ArticleForm";
import AiGenerateForm from "@/components/admin/AiGenerateForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const supabase = await createClient();
  const { data: topics } = await supabase.from("topics").select("*");
  const list = sortTopicsByNavOrder(
    (topics ?? []).filter((t) => IT_TOPIC_SLUGS.has(t.slug)),
  );

  return (
    <>
      <AdminPageHeader
        kicker="Content"
        title="New article"
        description="Pick a topic to auto-generate a trending IT story (Claude + Pexels), paste your own titles, or write by hand."
        backHref="/admin/articles"
        backLabel="Articles"
      />
      <AiGenerateForm topics={list} />
      <p className="admin-or">Or write it yourself</p>
      <ArticleForm action={createArticle} topics={list} />
    </>
  );
}
