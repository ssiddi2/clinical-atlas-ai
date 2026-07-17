import { useTranslation } from "@/i18n/LanguageContext";

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-1">
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl font-bold mb-8">{t("privacy.title")}</h1>
            <p className="text-muted-foreground mb-8">{t("privacy.lastUpdated")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.section1.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("privacy.section1.content")}</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>{t("privacy.section1.item1")}</li>
              <li>{t("privacy.section1.item2")}</li>
              <li>{t("privacy.section1.item3")}</li>
              <li>{t("privacy.section1.item4")}</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.section2.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("privacy.section2.content")}</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>{t("privacy.section2.item1")}</li>
              <li>{t("privacy.section2.item2")}</li>
              <li>{t("privacy.section2.item3")}</li>
              <li>{t("privacy.section2.item4")}</li>
              <li>{t("privacy.section2.item5")}</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.section3.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("privacy.section3.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.section4.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("privacy.section4.content")}</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>{t("privacy.section4.item1")}</li>
              <li>{t("privacy.section4.item2")}</li>
              <li>{t("privacy.section4.item3")}</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.section5.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("privacy.section5.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.section6.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("privacy.section6.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.section7.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("privacy.section7.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("privacy.section8.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("privacy.section8.content")}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
