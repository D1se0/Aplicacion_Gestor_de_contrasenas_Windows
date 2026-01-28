import React from "react";

export function GlassCard(props: React.PropsWithChildren<{ className?: string }>) {
    return (
        <div className={`glass card ${props.className ?? ""}`}>
            {props.children}
        </div>
    );
}
