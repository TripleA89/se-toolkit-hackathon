export type AppLanguage = "ru" | "en";

type UIText = {
  appTitle: string;
  appTagline: string;
  navAnalyze: string;
  navHistory: string;
  analyzeEyebrow: string;
  analyzeTitle: string;
  analyzeSubtitle: string;
  rawNotesLabel: string;
  rawNotesPlaceholder: string;
  outputLanguageLabel: string;
  charactersCount: string;
  insertSample: string;
  analyzeButton: string;
  analyzingButton: string;
  resultEyebrow: string;
  resultTitle: string;
  noResult: string;
  noResultTitle: string;
  noResultHint: string;
  historyEyebrow: string;
  historyTitle: string;
  historyLoading: string;
  historyEmpty: string;
  historyAccountHint: string;
  historyLoadMore: string;
  historyLoadingMore: string;
  authEyebrow: string;
  authLoginTitle: string;
  authRegisterTitle: string;
  authPromoTitle: string;
  authSubtitle: string;
  authFeatureHistory: string;
  authFeatureExport: string;
  authFeatureLanguage: string;
  authHint: string;
  authLoginTab: string;
  authRegisterTab: string;
  authUsernameLabel: string;
  authPasswordLabel: string;
  authUsernamePlaceholder: string;
  authPasswordPlaceholder: string;
  authLoginButton: string;
  authRegisterButton: string;
  authLoggingIn: string;
  authRegistering: string;
  authLogout: string;
  authLoggedAs: string;
  authCheckingSession: string;
  resultCardEyebrow: string;
  summary: string;
  decisions: string;
  actionItems: string;
  noDecisions: string;
  noActionItems: string;
  createdAt: string;
  model: string;
  exportMarkdown: string;
  exporting: string;
  errorEmptyNotes: string;
  errorEmptyCredentials: string;
  errorGeneric: string;
  errorRateLimited: string;
  errorApiKeyMissing: string;
  errorModelsUnavailable: string;
  errorInvalidModelResponse: string;
  errorNetwork: string;
  errorInvalidCredentials: string;
  errorUsernameTaken: string;
  errorUnauthorized: string;
};

const UI_TEXT: Record<AppLanguage, UIText> = {
  ru: {
    appTitle: "Meeting Notes Organizer",
    appTagline: "Из хаоса заметок в четкие решения за минуты",
    navAnalyze: "Анализ",
    navHistory: "История",
    analyzeEyebrow: "Умный разбор",
    analyzeTitle: "Анализ заметок встречи",
    analyzeSubtitle: "Вставьте сырые заметки, получите структурированный итог: резюме, решения и действия.",
    rawNotesLabel: "Сырые заметки",
    rawNotesPlaceholder: "Вставьте заметки встречи...",
    outputLanguageLabel: "Язык результата",
    charactersCount: "Символов",
    insertSample: "Подставить пример",
    analyzeButton: "Анализировать",
    analyzingButton: "Анализируем...",
    resultEyebrow: "Структурированный вывод",
    resultTitle: "Результат",
    noResult: "Пока нет результата.",
    noResultTitle: "Здесь появится результат анализа",
    noResultHint: "Нажмите «Анализировать», и мы автоматически выделим главное, решения и список задач.",
    historyEyebrow: "Архив аккаунта",
    historyTitle: "История",
    historyLoading: "Загрузка истории...",
    historyEmpty: "Сохраненных анализов пока нет.",
    historyAccountHint: "История загружается из вашего аккаунта.",
    historyLoadMore: "Загрузить еще",
    historyLoadingMore: "Загружаем...",
    authEyebrow: "Ваше рабочее пространство",
    authLoginTitle: "Вход в аккаунт",
    authRegisterTitle: "Регистрация",
    authPromoTitle: "Храните историю встреч в личном аккаунте",
    authSubtitle: "Войдите, чтобы сохранять и видеть историю только вашего пользователя.",
    authFeatureHistory: "Персональная история анализов",
    authFeatureExport: "Экспорт в Markdown в один клик",
    authFeatureLanguage: "Мгновенное переключение RU/EN",
    authHint: "Логин и пароль обязательны.",
    authLoginTab: "Вход",
    authRegisterTab: "Регистрация",
    authUsernameLabel: "Логин",
    authPasswordLabel: "Пароль",
    authUsernamePlaceholder: "например, team_lead",
    authPasswordPlaceholder: "Введите пароль",
    authLoginButton: "Войти",
    authRegisterButton: "Создать аккаунт",
    authLoggingIn: "Входим...",
    authRegistering: "Регистрируем...",
    authLogout: "Выйти",
    authLoggedAs: "Вы вошли как",
    authCheckingSession: "Проверяем сессию...",
    resultCardEyebrow: "Готово к использованию",
    summary: "Краткое резюме",
    decisions: "Решения",
    actionItems: "Действия",
    noDecisions: "Явных решений не найдено.",
    noActionItems: "Действий не найдено.",
    createdAt: "Создано",
    model: "Модель",
    exportMarkdown: "Скачать Markdown",
    exporting: "Скачиваем...",
    errorEmptyNotes: "Введите текст заметок перед отправкой.",
    errorEmptyCredentials: "Введите логин и пароль.",
    errorGeneric: "Не удалось выполнить запрос. Попробуйте еще раз.",
    errorRateLimited: "Бесплатная модель временно перегружена (rate limit). Повторите через 30-120 секунд.",
    errorApiKeyMissing: "Не настроен LLM_API_KEY в .env.",
    errorModelsUnavailable: "Сейчас все доступные бесплатные модели недоступны. Повторите позже.",
    errorInvalidModelResponse: "Модель вернула ответ в неожиданном формате. Повторите запрос.",
    errorNetwork: "Проблема соединения с API. Проверьте сеть и попробуйте снова.",
    errorInvalidCredentials: "Неверный логин или пароль.",
    errorUsernameTaken: "Такой логин уже занят.",
    errorUnauthorized: "Сессия истекла. Войдите снова.",
  },
  en: {
    appTitle: "Meeting Notes Organizer",
    appTagline: "Turn messy notes into clear decisions in minutes",
    navAnalyze: "Analyze",
    navHistory: "History",
    analyzeEyebrow: "Smart Processing",
    analyzeTitle: "Analyze Meeting Notes",
    analyzeSubtitle: "Paste raw notes and get a clean structure: summary, decisions, and action items.",
    rawNotesLabel: "Raw Notes",
    rawNotesPlaceholder: "Paste meeting notes here...",
    outputLanguageLabel: "Output language",
    charactersCount: "Characters",
    insertSample: "Insert sample",
    analyzeButton: "Analyze",
    analyzingButton: "Analyzing...",
    resultEyebrow: "Structured Output",
    resultTitle: "Result",
    noResult: "No result yet.",
    noResultTitle: "Your analysis result will appear here",
    noResultHint: "Click Analyze and we will extract the key summary, decisions, and tasks automatically.",
    historyEyebrow: "Account Archive",
    historyTitle: "History",
    historyLoading: "Loading history...",
    historyEmpty: "No saved analyses yet.",
    historyAccountHint: "History is loaded from your account.",
    historyLoadMore: "Load more",
    historyLoadingMore: "Loading...",
    authEyebrow: "Your Workspace",
    authLoginTitle: "Sign In",
    authRegisterTitle: "Create Account",
    authPromoTitle: "Keep your meeting history in a personal account",
    authSubtitle: "Sign in to keep and view history for your user account.",
    authFeatureHistory: "Personal analysis history",
    authFeatureExport: "One-click Markdown export",
    authFeatureLanguage: "Instant RU/EN switch",
    authHint: "Username and password are required.",
    authLoginTab: "Login",
    authRegisterTab: "Register",
    authUsernameLabel: "Username",
    authPasswordLabel: "Password",
    authUsernamePlaceholder: "e.g. team_lead",
    authPasswordPlaceholder: "Enter password",
    authLoginButton: "Sign In",
    authRegisterButton: "Create Account",
    authLoggingIn: "Signing in...",
    authRegistering: "Registering...",
    authLogout: "Logout",
    authLoggedAs: "Signed in as",
    authCheckingSession: "Checking session...",
    resultCardEyebrow: "Ready To Use",
    summary: "Summary",
    decisions: "Decisions",
    actionItems: "Action Items",
    noDecisions: "No decisions found.",
    noActionItems: "No action items found.",
    createdAt: "Created",
    model: "Model",
    exportMarkdown: "Download Markdown",
    exporting: "Downloading...",
    errorEmptyNotes: "Please enter meeting notes before submitting.",
    errorEmptyCredentials: "Please enter username and password.",
    errorGeneric: "Request failed. Please try again.",
    errorRateLimited: "Free model is temporarily rate-limited. Retry in 30-120 seconds.",
    errorApiKeyMissing: "LLM_API_KEY is not configured in .env.",
    errorModelsUnavailable: "All configured free models are currently unavailable. Try again later.",
    errorInvalidModelResponse: "Model returned an unexpected format. Please retry.",
    errorNetwork: "Network issue while contacting API. Please try again.",
    errorInvalidCredentials: "Invalid username or password.",
    errorUsernameTaken: "Username is already taken.",
    errorUnauthorized: "Session expired. Please sign in again.",
  },
};

export function getText(language: AppLanguage): UIText {
  return UI_TEXT[language];
}
