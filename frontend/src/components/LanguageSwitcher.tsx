import type { OutputLanguage } from "../api/client";

interface LanguageSwitcherProps {
  value: OutputLanguage;
  onChange: (value: OutputLanguage) => void;
}

export default function LanguageSwitcher({ value, onChange }: LanguageSwitcherProps) {
  return (
    <div className="lang-switcher" role="group" aria-label="Output language">
      <button
        type="button"
        className={value === "ru" ? "active" : ""}
        onClick={() => onChange("ru")}
      >
        RU
      </button>
      <button
        type="button"
        className={value === "en" ? "active" : ""}
        onClick={() => onChange("en")}
      >
        EN
      </button>
    </div>
  );
}
