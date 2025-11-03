"use client";

import { ChevronRightIcon, ChevronLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { slideInFromLeft, slideInFromRight, slideInFromTop } from "@/lib/motion";
import onboardPng from "@/app/onboard.png";

type MenuItem = { label: string; href: string };

const MENU: MenuItem[] = [
  { label: "Nova conta", href: "/signup" },
  { label: "Carregar conta", href: "/signin" },
  { label: "Opções", href: "/settings" },
  { label: "Manual", href: "/manual" },
];

const ROLES = [
  { label: "Estudante", slug: "estudante" },
  { label: "Pesquisador", slug: "pesquisador" },
  { label: "Profissional", slug: "profissional" },
  { label: "Empresário", slug: "empresario" },
] as const;

type Role = typeof ROLES[number]["slug"];

const REQUIRED_BY_ROLE: Record<Role, { label: string; placeholder: string }> = {
  estudante: { label: "Digite seu CPF", placeholder: "000.000.000-00" },
  pesquisador: { label: "Informe seu ORCID ou ID Lattes", placeholder: "0000-0001-2345-6789 (ORCID) · ou URL Lattes" },
  profissional: { label: "Digite seu CPF (ou CNPJ)", placeholder: "CPF ou CNPJ" },
  empresario: { label: "Digite o CNPJ da sua empresa", placeholder: "00.000.000/0001-00" },
};

/* ----------------------- UI helpers ----------------------- */
function Tip({ title, active = false }: { title: string; active?: boolean }) {
  return (
      <div className="relative mb-4">
        <div
            className={[
              "inline-block rounded-xl px-4 py-3 text-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.35)] border",
              active
                  ? "border-cyan-300/40 bg-[linear-gradient(90deg,#22d3ee,#8b5cf6,#22d3ee)] bg-[length:200%_100%] animate-[gradientFlow_9s_ease_infinite]"
                  : "border-white/10 bg-white/5",
            ].join(" ")}
        >
          <div className="text-[13px] font-semibold tracking-wider text-white">{title}</div>
        </div>
        <div
            className={[
              "absolute -bottom-3 left-6 w-6 h-6 rotate-45",
              active ? "bg-cyan-400/30" : "bg-white/5",
              active ? "border-b border-r border-cyan-300/40" : "border-b border-r border-white/10",
            ].join(" ")}
        />
      </div>
  );
}

function Field({
                 tipTitle,
                 active,
                 children,
               }: {
  tipTitle: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
      <div className="mb-6">
        <Tip title={tipTitle} active={!!active} />
        <div className="flex items-center gap-3">{children}</div>
      </div>
  );
}

const baseInput =
    "flex-1 rounded-xl border border-white/12 bg-black/70 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-400/60";

/* ----------------------- Onboarding Modal ----------------------- */
function OnboardModal({
                        open,
                        onClose,
                        role,
                      }: {
  open: boolean;
  onClose: () => void;
  role: Role;
}) {
  const [idValue, setIdValue] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [ensino, setEnsino] = useState<"sim" | "nao">("sim");

  const [step, setStep] = useState(0);

  const idRef = useRef<HTMLInputElement | null>(null);
  const nomeRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const celularRef = useRef<HTMLInputElement | null>(null);
  const radioSimRef = useRef<HTMLInputElement | null>(null);

  const req = REQUIRED_BY_ROLE[role];
  const isPesquisador = role === "pesquisador";

  const steps = [
    { key: "id", label: req.label, placeholder: req.placeholder, type: "text" as const },
    { key: "nome", label: "Nome completo", placeholder: "Seu nome e sobrenome", type: "text" as const },
    { key: "email", label: "E-mail", placeholder: "voce@email.com", type: "email" as const },
    { key: "celular", label: "Celular", placeholder: "(00) 90000-0000", type: "text" as const },
    ...(isPesquisador ? [] : [{ key: "ensino", label: "Concluiu o ensino médio?", type: "radio" as const }]),
  ] as const;
  const lastIndex = steps.length - 1;

  const validate = (idx: number) => {
    const key = steps[idx]?.key;
    if (!key) return false;
    if (key === "id") return idValue.trim().length > 3;
    if (key === "nome") return nome.trim().length > 2;
    if (key === "email") return /\S+@\S+\.\S+/.test(email);
    if (key === "celular") return celular.trim().replace(/\D/g, "").length >= 10;
    if (key === "ensino") return ensino === "sim" || ensino === "nao";
    return false;
  };

  const canSubmit = steps.every((_, i) => validate(i));

  useEffect(() => {
    if (open) {
      setIdValue("");
      setNome("");
      setEmail("");
      setCelular("");
      setEnsino("sim");
      setStep(0);

      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const t = setTimeout(() => idRef.current?.focus(), 20);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const key = steps[step]?.key;
      if (key === "id") idRef.current?.focus();
      if (key === "nome") nomeRef.current?.focus();
      if (key === "email") emailRef.current?.focus();
      if (key === "celular") celularRef.current?.focus();
      if (key === "ensino") radioSimRef.current?.focus();
    }, 10);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    const code = e.code;

    if (code === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (code === "Backspace" || code === "Delete") {
      const key = steps[step]?.key;
      const valueNow =
          key === "id"
              ? idValue
              : key === "nome"
                  ? nome
                  : key === "email"
                      ? email
                      : key === "celular"
                          ? celular
                          : "";
      if (!valueNow || key === "ensino") {
        e.preventDefault();
        setStep((s) => Math.max(0, s - 1));
      }
      return;
    }
    if (code === "Enter") {
      e.preventDefault();
      if (!validate(step)) return;

      if (step < lastIndex) {
        setStep((s) => Math.min(lastIndex, s + 1));
      } else if (canSubmit) {
        const q = new URLSearchParams({
          role,
          id: idValue,
          nome,
          email,
          celular,
          ...(isPesquisador ? {} : { ensino }),
        }).toString();
        window.location.assign(`/signup?${q}`);
      }
    }
  };

  if (!open) return null;

  const inputClass =
      "h-10 rounded-lg border border-white/10 bg-black/70 px-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-400/60";

  return (
      <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          onKeyDown={handleKeyDown}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-[960px] rounded-2xl border border-white/10 bg-[rgba(7,16,28,0.85)] shadow-[0_10px_50px_rgba(0,0,0,0.55)] overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#22d3ee)]/80 animate-pulse" />
          <button
              onClick={onClose}
              className="absolute right-3 top-3 rounded-md p-2 text-white/70 hover:bg-white/10"
              aria-label="Fechar"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-[1.3fr_0.7fr]">
            {/* lado esquerdo */}
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 mb-3">
                {/* (removido ícone Sparkles) */}
                <p className="text-sm text-white/85 tracking-wide">
                  Nova Conta · {ROLES.find((r) => r.slug === role)?.label}
                </p>
              </div>

              {steps.map((s, i) => {
                const active = i === step;
                return (
                    <motion.div
                        key={s.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-[220px_1fr] items-center gap-3"
                    >
                      <div
                          className={[
                            "rounded-lg px-3 py-2 border",
                            active
                                ? "border-cyan-300/50 bg-[linear-gradient(120deg,rgba(34,211,238,.18),rgba(139,92,246,.18))] shadow-[0_0_22px_rgba(34,211,238,0.25)]"
                                : "border-white/10 bg-white/[0.06]",
                          ].join(" ")}
                      >
                        <p className="text-[12px] text-white font-semibold">{s.label}</p>
                      </div>

                      {s.type === "radio" ? (
                          <div className="flex gap-5">
                            <label className="flex items-center gap-2 text-white/85">
                              <input
                                  ref={radioSimRef}
                                  type="radio"
                                  name="ensino"
                                  checked={ensino === "sim"}
                                  onChange={() => setEnsino("sim")}
                                  className="accent-cyan-400"
                              />
                              <span>Sim</span>
                            </label>
                            <label className="flex items-center gap-2 text-white/85">
                              <input
                                  type="radio"
                                  name="ensino"
                                  checked={ensino === "nao"}
                                  onChange={() => setEnsino("nao")}
                                  className="accent-cyan-400"
                              />
                              <span>Não</span>
                            </label>
                          </div>
                      ) : (
                          <input
                              ref={
                                s.key === "id"
                                    ? idRef
                                    : s.key === "nome"
                                        ? nomeRef
                                        : s.key === "email"
                                            ? emailRef
                                            : celularRef
                              }
                              className={inputClass}
                              placeholder={s.placeholder}
                              type={s.type}
                              value={
                                s.key === "id"
                                    ? idValue
                                    : s.key === "nome"
                                        ? nome
                                        : s.key === "email"
                                            ? email
                                            : celular
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (s.key === "id") setIdValue(val);
                                if (s.key === "nome") setNome(val);
                                if (s.key === "email") setEmail(val);
                                if (s.key === "celular") setCelular(val);
                              }}
                          />
                      )}
                    </motion.div>
                );
              })}

              <div className="flex items-center gap-3 pt-3">
                <button
                    disabled={!canSubmit}
                    onClick={() => {
                      const q = new URLSearchParams({
                        role,
                        id: idValue,
                        nome,
                        email,
                        celular,
                        ...(isPesquisador ? {} : { ensino }),
                      }).toString();
                      window.location.assign(`/signup?${q}`);
                    }}
                    className={[
                      "rounded-xl px-5 h-10 text-sm font-semibold text-white",
                      "bg-[linear-gradient(90deg,#22d3ee,#60a5fa,#22d3ee)] hover:brightness-110",
                      "shadow-[0_0_22px_rgba(56,189,248,0.38)] transition",
                      !canSubmit ? "opacity-50 cursor-not-allowed" : "",
                    ].join(" ")}
                >
                  Continuar
                </button>
                <button
                    onClick={onClose}
                    className="rounded-xl px-5 h-10 text-sm font-semibold text-white/80 hover:text-white border border-white/15"
                >
                  Cancelar
                </button>
              </div>
            </div>

            {/* personagem */}
            <div className="relative flex justify-end pr-4 pt-2">
              <div className="absolute -top-6 -right-6 w-56 h-56 rounded-full bg-cyan-400/10 blur-2xl" />
              <Image
                  src={onboardPng}
                  alt="Zaeon Onboard"
                  className="w-[85%] max-w-[360px] h-auto object-contain drop-shadow-[0_0_25px_rgba(34,211,238,0.25)] translate-y-[-20px]"
                  priority
                  draggable={false}
              />
            </div>
          </div>
        </motion.div>
      </div>
  );
}

/* ---------------------------------------------------------------- */

export const HeroContent = () => {
  const [index, setIndex] = useState(0);
  const [roleIndex, setRoleIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [chosenRole, setChosenRole] = useState<Role>("estudante");

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (onboardOpen) return;

      if (pickerOpen) {
        if (["ArrowLeft", "KeyA"].includes(e.code)) {
          e.preventDefault();
          setRoleIndex((r) => (r - 1 + ROLES.length) % ROLES.length);
          return;
        }
        if (["ArrowRight", "KeyD"].includes(e.code)) {
          e.preventDefault();
          setRoleIndex((r) => (r + 1) % ROLES.length);
          return;
        }
        if (e.code === "Enter") {
          e.preventDefault();
          const chosen = ROLES[roleIndex];
          setChosenRole(chosen.slug);
          setOnboardOpen(true);
          return;
        }
        if (e.code === "Escape") {
          e.preventDefault();
          setPickerOpen(false);
          return;
        }
        return;
      }

      if (["ArrowUp", "KeyW"].includes(e.code)) {
        e.preventDefault();
        setIndex((i) => (i - 1 + MENU.length) % MENU.length);
        return;
      }
      if (["ArrowDown", "KeyS"].includes(e.code)) {
        e.preventDefault();
        setIndex((i) => (i + 1) % MENU.length);
        return;
      }
      if (e.code === "Enter") {
        const item = MENU[index];
        if (!item) return;
        if (item.label === "Nova conta") {
          e.preventDefault();
          setPickerOpen(true);
          return;
        }
        window.location.assign(item.href);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, pickerOpen, roleIndex, onboardOpen]);

  useEffect(() => {
    if (!onboardOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [onboardOpen]);

  const panel =
      "relative w-full max-w-[420px] mt-16 sm:mt-24 rounded-2xl overflow-hidden backdrop-blur-2xl border border-white/10 " +
      "shadow-[0_0_40px_rgba(34,211,238,0.12)] " +
      "bg-[linear-gradient(135deg,rgba(7,38,77,0.28),rgba(11,58,164,0.25),rgba(16,134,201,0.32),rgba(11,58,164,0.25),rgba(7,38,77,0.28))] " +
      "bg-[length:400%_400%] animate-[gradientFlow_12s_ease-in-out_infinite] " +
      "after:pointer-events-none after:absolute after:inset-0 after:bg-[repeating-linear-gradient(transparent_0px,transparent_8px,rgba(255,255,255,0.025)_9px,transparent_10px)] after:opacity-20";

  const cardBase =
      "group relative overflow-hidden flex items-center justify-between rounded-xl px-5 min-h-[56px] sm:min-h-[64px] " +
      "ring-1 ring-white/10 text-white transition-all duration-300 ease-out " +
      "bg-[linear-gradient(120deg,rgba(3,22,45,0.55),rgba(6,42,90,0.55),rgba(7,60,120,0.55))] " +
      "hover:bg-[linear-gradient(120deg,rgba(6,50,100,0.65),rgba(8,60,130,0.65))] " +
      "hover:scale-[1.02] focus-visible:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 " +
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_12px_rgba(34,211,238,0.12)]";

  const cardSelected = "ring-cyan-300/45 shadow-[0_0_28px_rgba(34,211,238,0.25)]";

  const accentBar = (active: boolean) =>
      [
        "absolute left-0 top-0 h-full w-[3px] rounded-l-xl",
        active
            ? "bg-[linear-gradient(180deg,#22d3ee,#60a5fa,#22d3ee)]"
            : "bg-white/10 group-hover:bg-[linear-gradient(180deg,rgba(34,211,238,.7),rgba(96,165,250,.7),rgba(34,211,238,.7))]",
      ].join(" ");

  const labelClass = "text-[15px] sm:text-[16px] font-medium tracking-[0.01em] text-white";

  const NovaContaItem = (selected: boolean) => (
      <li>
        <button
            type="button"
            className={[cardBase, selected ? cardSelected : "", "pr-3"].join(" ")}
            onMouseEnter={() => setIndex(0)}
            onClick={() => setPickerOpen(true)}
            aria-expanded={pickerOpen}
            aria-haspopup="dialog"
        >
          <span className={accentBar(selected)} />
          <span className={labelClass}>Nova conta</span>

          <div className="flex items-center gap-2 sm:gap-3">
            {!pickerOpen ? (
                <ChevronRightIcon className="h-5 w-5 text-white/85 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
            ) : (
                <motion.div
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="flex items-center gap-3"
                    role="dialog"
                    aria-label="Selecione sua classe"
                >
                  <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoleIndex((r) => (r - 1 + ROLES.length) % ROLES.length);
                      }}
                      className="rounded-md p-1.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-white/95" />
                  </button>

                  <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const chosen = ROLES[roleIndex];
                        setChosenRole(chosen.slug);
                        setOnboardOpen(true);
                      }}
                      className={[
                        "select-none px-5 py-2 rounded-xl text-[14px] sm:text-[15px] font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer",
                        "text-white bg-black/85 border border-white/15",
                        "shadow-[0_0_16px_rgba(255,255,255,0.08)] hover:bg-black hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]",
                        "ring-2 ring-cyan-400/40 shadow-[0_0_30px_rgba(56,189,248,0.45)]",
                      ].join(" ")}
                  >
                    {ROLES[roleIndex].label}
                  </div>

                  <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoleIndex((r) => (r + 1) % ROLES.length);
                      }}
                      className="rounded-md p-1.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-white/95" />
                  </button>
                </motion.div>
            )}
          </div>
        </button>
      </li>
  );

  return (
      <>
        {/* conteúdo bloqueado quando modal abre */}
        <div
            ref={containerRef}
            className="relative w-full min-h-screen text-white px-6 sm:px-12 py-12"
            aria-hidden={onboardOpen}
            style={{ pointerEvents: onboardOpen ? ("none" as const) : ("auto" as const) }}
        >
          <div className="mx-auto max-w-[1400px] flex gap-8 lg:gap-12 items-start">
            {/* MENU */}
            <motion.aside variants={slideInFromLeft(0.12)} initial="hidden" animate="visible" className={panel}>
              <div className="flex items-center gap-3 px-6 pt-7 pb-4">
                {/* (removido ícone Sparkles) */}
                <p className="text-sm text-white/85 tracking-[0.05em]">Powered by Google</p>
              </div>

              <nav className="px-4 sm:px-6 pb-6">
                <ul className="flex flex-col gap-3">
                  {NovaContaItem(0 === 0 && true)}
                  {MENU.slice(1).map((item, i) => {
                    const realIndex = i + 1;
                    const selected = realIndex === index;
                    return (
                        <li key={item.label}>
                          <Link
                              href={item.href}
                              className={[cardBase, selected ? cardSelected : ""].join(" ")}
                              onMouseEnter={() => setIndex(realIndex)}
                          >
                            <span className={accentBar(selected)} />
                            <span className={labelClass}>{item.label}</span>
                            <ChevronRightIcon className="h-5 w-5 text-white/85 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="px-6 pb-7 text-[11px] text-white/55 tracking-wide">Zaeon OS — v0.1</div>
            </motion.aside>

            {/* CONTEÚDO */}
            <motion.div initial="hidden" animate="visible" className="flex-1 min-h-[60vh] flex items-start">
              <div>
                {/* badge do topo sem o ícone */}
                <motion.div
                    variants={slideInFromTop}
                    className="w-fit py-2 px-3 border border-white/15 bg-white/5 rounded-lg flex items-center gap-2 shadow-[0_0_24px_rgba(34,211,238,0.16)]"
                >
                  <span className="text-[13px] text-white/85"></span>
                </motion.div>

                <motion.h1
                    variants={slideInFromRight(0.28)}
                    className="mt-6 text-5xl sm:text-6xl font-light tracking-tight leading-tight max-w-[780px] select-none"
                >
                <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: "linear-gradient(90deg,#22d3ee,#60a5fa,#22d3ee)",
                      backgroundSize: "260% 100%",
                      WebkitTextStroke: "0.4px rgba(255,255,255,0.08)",
                    }}
                />
                </motion.h1>
              </div>
            </motion.div>
          </div>

          <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(-4px) scale(1); opacity: .9; }
            50% { transform: translateY(4px) scale(1.02); opacity: 1; }
          }
        `}</style>
        </div>

        {/* modal fora do wrapper */}
        <OnboardModal open={onboardOpen} onClose={() => setOnboardOpen(false)} role={chosenRole} />
      </>
  );
};