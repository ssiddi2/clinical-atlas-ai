import { useTranslation, LANGUAGE_OPTIONS } from "@/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/i18n";

const LanguageSwitcher = () => {
  const { locale, setLocale } = useTranslation();
  const current = LANGUAGE_OPTIONS.find((l) => l.value === locale);

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
      <SelectTrigger className="w-auto gap-1.5 border-0 bg-transparent text-white/70 hover:text-white text-xs h-8 px-2.5 focus:ring-0 focus:ring-offset-0 [&>svg]:text-white/40">
        <span className="mr-0.5">{current?.flag}</span>
        <span>{current?.nativeLabel}</span>
      </SelectTrigger>
      <SelectContent className="min-w-[160px]">
        {LANGUAGE_OPTIONS.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.nativeLabel}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
