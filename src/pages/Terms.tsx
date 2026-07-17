import { useTranslation } from "@/i18n/LanguageContext";

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-1">
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl font-bold mb-8">{t("terms.title")}</h1>
            <p className="text-muted-foreground mb-8">{t("terms.lastUpdated")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.section1.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section1.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.section2.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section2.content")}</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>{t("terms.section2.item1")}</li>
              <li>{t("terms.section2.item2")}</li>
              <li>{t("terms.section2.item3")}</li>
              <li>{t("terms.section2.item4")}</li>
              <li>{t("terms.section2.item5")}</li>
              <li>{t("terms.section2.item6")}</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.section2a.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section2a.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.section3.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section3.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.section4.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section4.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.section5.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section5.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.section6.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section6.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.section7.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section7.content")}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t("terms.section8.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("terms.section8.content")}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
