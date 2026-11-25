import { useEffect, useState, type CSSProperties } from "react";
import { useWideScreen } from "../../lib/desktop.ts";
import { postNative } from "../../lib/native.ts";
import { runTransition } from "../../lib/nav.tsx";
import type { Role } from "../../lib/types.ts";
import { AuthFlow, type AuthMode, type Prefill } from "./AuthFlow.tsx";
import { isAuthEmbed, notifyAuthEmbed } from "./embed.ts";
import { onboardingIntent } from "./intent.ts";

type Screen = { name: "auth"; mode: AuthMode; role?: Role; prefill?: Prefill; key: number };

function openingScreen(): Screen {
  const conta = new URLSearchParams(window.location.search).get("conta");
  if (conta === "loja" || onboardingIntent.value === "business") {
    return { name: "auth", mode: "signup", role: "business", key: 1 };
  }
  if (conta === "criar") return { name: "auth", mode: "signup", key: 1 };
  return { name: "auth", mode: "signin", key: 1 };
}

export function Onboarding() {
  const [screen, setScreen] = useState<Screen>(openingScreen);
  const wide = useWideScreen();
  const embed = isAuthEmbed();

  useEffect(() => {
    onboardingIntent.value = null;
  }, []);

  useEffect(() => {
    document.title = screen.mode === "signup" ? "Criar conta · Obi Ágil" : "Entrar · Obi Ágil";
  }, [screen.mode]);

  const leave = () => {
    if (embed) notifyAuthEmbed("close");
    else postNative({ type: "exit" });
  };
  const show = (next: Screen) => runTransition("push", () => setScreen(next));

  const flow = (
    <AuthFlow
      key={screen.key}
      mode={screen.mode}
      initialRole={screen.role}
      prefill={screen.prefill}
      onExit={leave}
      wide={false}
      panel={wide && !embed}
      onSwitch={(mode, prefill) => show({ name: "auth", mode, prefill, key: Date.now() })}
    />
  );

  if (embed || !wide) return flow;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div
        className="w-full max-w-[440px] overflow-hidden rounded-[28px] border border-border bg-background elev-2"
        style={{ "--safe-top": "0px", "--safe-bottom": "0px" } as CSSProperties}
      >
        {flow}
      </div>
    </div>
  );
}
