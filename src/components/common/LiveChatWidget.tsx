"use client";

import { useEffect } from "react";

interface ChatConfig {
  enabled: boolean;
  provider: "tidio" | "tawkto" | "crisp" | "custom";
  widget_id: string;
  script_url: string;
}

export function LiveChatWidget() {
  useEffect(() => {
    fetch("/api/live-chat")
      .then((r) => r.json())
      .then((cfg: ChatConfig) => {
        if (!cfg?.enabled || !cfg.widget_id) return;

        const s = document.createElement("script");
        s.async = true;

        switch (cfg.provider) {
          case "tidio":
            s.src = `//code.tidio.co/${cfg.widget_id}.js`;
            break;
          case "tawkto": {
            // Tawk.to requires two-part ID (property/widget)
            const [propId, widgetId] = cfg.widget_id.split("/");
            s.src = `https://embed.tawk.to/${propId}/${widgetId || "default"}`;
            s.setAttribute("crossorigin", "*");
            break;
          }
          case "crisp":
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).$crisp = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).CRISP_WEBSITE_ID = cfg.widget_id;
            s.src = "https://client.crisp.chat/l.js";
            break;
          case "custom":
            if (!cfg.script_url) return;
            s.src = cfg.script_url;
            break;
          default:
            return;
        }

        document.head.appendChild(s);
      })
      .catch(() => {});
  }, []);

  return null;
}
