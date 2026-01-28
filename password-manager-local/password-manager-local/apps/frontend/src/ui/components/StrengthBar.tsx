import React from "react";

export function StrengthBar({ score }: { score: number }) {
    const pct = Math.max(0, Math.min(100, score));
    let label = "Débil";
    if (pct >= 80) label = "Excelente";
    else if (pct >= 60) label = "Fuerte";
    else if (pct >= 40) label = "Aceptable";

    return (
        <div>
            <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="small">Fortaleza: {label}</span>
                <span className="small">{pct}/100</span>
            </div>
            <div style={{
                height: 10,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(0,0,0,0.25)",
                overflow: "hidden"
            }}>
                <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: pct >= 80 ? "rgba(46,229,157,0.75)"
                        : pct >= 60 ? "rgba(168,85,247,0.75)"
                            : pct >= 40 ? "rgba(255,255,255,0.35)"
                                : "rgba(255,77,109,0.75)"
                }} />
            </div>
        </div>
    );
}
