import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "primary" | "danger";
};

export function Button({ variant = "default", className, ...rest }: Props) {
    const v =
        variant === "primary" ? "btn btnPrimary"
            : variant === "danger" ? "btn btnDanger"
                : "btn";
    return <button {...rest} className={`${v} ${className ?? ""}`} />;
}
