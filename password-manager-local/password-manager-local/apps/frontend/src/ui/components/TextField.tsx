import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    inputRef?: React.Ref<HTMLInputElement>;
};

export function TextField({ label, inputRef, ...props }: Props) {
    return (
        <label className="textfield">
            <span>{label}</span>
            <input ref={inputRef} {...props} />
        </label>
    );
}
