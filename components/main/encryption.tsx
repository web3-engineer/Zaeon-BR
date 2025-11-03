"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import whoAre from "@/app/who-are-zaeon.png";

export default function Encryption() {
    const reduced = useMemo(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
        []
    );

    const sectionRef = useRef<HTMLDivElement | null>(null);
    const [hovering, setHovering] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 }); // posição absoluta dentro da section

    const handleMove = (e: React.MouseEvent) => {
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        // posição do cursor relativa ao container (para posicionar o botão com absolute)
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPos({ x, y });
    };

    const handleClick = () => {
        // TODO: coloque aqui a ação do botão
        // exemplo de navegação: window.location.assign("/about");
        // exemplo de modal: setOpen(true)
        window.location.assign("/about");
    };

    return (
        <section
            id="about-us"
            ref={sectionRef}
            className="relative flex flex-col items-center justify-center min-h-[100vh] w-full overflow-hidden"
        >
            {/* Vídeo de fundo */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <video
                    className="h-full w-full object-cover"
                    loop
                    muted
                    autoPlay
                    playsInline
                    preload="none"
                >
                    <source src="/videos/encryption-bg.webm" type="video/webm" />
                </video>
            </div>

            {/* Texto principal sobre a imagem (com gradiente animado azul → violeta → verde) */}
            <motion.div
                className="absolute top-[14%] z-20 select-none text-center text-transparent bg-clip-text
                   text-[46px] sm:text-[54px] font-light tracking-tight leading-tight"
                animate={
                    reduced
                        ? {}
                        : {
                            y: [0, -8, 0],
                            opacity: [1, 0.85, 1],
                            backgroundImage: [
                                "linear-gradient(90deg,#3b82f6,#38bdf8,#22d3ee)", // azul → ciano
                                "linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)", // azul-violeta
                                "linear-gradient(90deg,#7c3aed,#8b5cf6,#10b981)", // violeta-verde
                                "linear-gradient(90deg,#3b82f6,#38bdf8,#22d3ee)", // volta ao azul
                            ],
                        }
                }
                transition={
                    reduced
                        ? {}
                        : {
                            duration: 12,
                            ease: "easeInOut",
                            repeat: Infinity,
                        }
                }
                style={{
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                Agentes de IA vindos de Outra Dimensão.
            </motion.div>

            {/* Imagem flutuando sobre o vídeo */}
            <div className="relative z-10 flex items-center justify-center mt-24">
                <motion.div
                    onMouseMove={handleMove}
                    onHoverStart={() => setHovering(true)}
                    onHoverEnd={() => setHovering(false)}
                    animate={reduced ? {} : { y: [0, -18, 0] }}
                    transition={reduced ? {} : { duration: 6, ease: "easeInOut", repeat: Infinity }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 1.02 }}
                    className="drop-shadow-[0_0_45px_rgba(56,189,248,0.5)] transition-transform duration-700 ease-out"
                >
                    <Image
                        src={whoAre}
                        alt="Who are Zaeon"
                        priority
                        draggable={false}
                        className="w-[90vw] max-w-[1180px] h-auto select-none"
                    />
                </motion.div>
            </div>

            {/* Botão "Saiba mais" que segue o cursor quando sobre a imagem */}
            <motion.button
                type="button"
                onClick={handleClick}
                // posição absoluta dentro da section, um pouco ACIMA do cursor
                className="pointer-events-auto absolute z-30 rounded-full px-3.5 py-1.5 text-[12px] font-semibold
                   text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]
                   bg-[linear-gradient(135deg,rgba(17,24,39,.9),rgba(30,58,138,.9))]
                   border border-white/15 backdrop-blur-sm"
                style={{
                    left: pos.x,
                    top: pos.y - 28, // sobe 28px para ficar "em cima" do cursor
                    transform: "translate(-50%, -100%)",
                }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={
                    hovering
                        ? { opacity: 1, scale: 1, x: 0, y: 0 }
                        : { opacity: 0, scale: 0.92 }
                }
                transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.6 }}
                aria-label="Saiba mais sobre a Zaeon"
            >
                Saiba mais
            </motion.button>

            {/* Vinheta suave para profundidade */}
            <div
                className="pointer-events-none absolute inset-0 z-[5]
                   bg-[radial-gradient(1000px_550px_at_50%_40%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_100%)]"
            />
        </section>
    );
}