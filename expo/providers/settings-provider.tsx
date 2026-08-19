import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { LangCode, LANGUAGES, StrKey, translate } from "@/lib/i18n";
import { Purchases } from "@/lib/revenuecat";

const LANG_STORAGE_KEY = "ppdf_lang";

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [lang, setLangState] = useState<LangCode>("en");
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY)
      .then((value) => {
        if (value && LANGUAGES.some((l) => l.code === value)) {
          setLangState(value as LangCode);
        }
      })
      .catch((e) => console.log("Failed to load language", e));
  }, []);

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    AsyncStorage.setItem(LANG_STORAGE_KEY, code).catch((e) =>
      console.log("Failed to persist language", e),
    );
  }, []);

  const t = useCallback(
    (key: StrKey, vars?: Record<string, string | number>) => translate(key, lang, vars),
    [lang],
  );

  const refreshPro = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setIsPro(!!info.entitlements.active["PixTools Pro"]);
    } catch {
      setIsPro(false);
    }
  }, []);

  useEffect(() => {
    refreshPro();
  }, [refreshPro]);

  return { lang, setLang, t, isPro, refreshPro };
});
