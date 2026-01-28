import React from "react";
import { CategoryIcons } from "../icons";
import type { Category } from "../../types";

export function CategoryPill({ category }: { category: Category }) {
    return (
        <span className="pill">
            <span>{CategoryIcons[category] ?? "✨"}</span>
            <span className="small" style={{ color: "rgba(233,230,255,0.85)" }}>{category}</span>
        </span>
    );
}
