import React from "react";

type IconProps = {
    name: string;
};

const Icon: React.FC<IconProps> = ({ name }) => {
    return (
        <i
            className={`nf ${name}`}
            style={{
                fontSize: "1.1em",
                lineHeight: 1,
                verticalAlign: "middle"
            }}
            aria-hidden="true"
        />
    );
};

export const Icons = {
    lock: <Icon name="nf-md-lock" />,
    plus: <Icon name="nf-md-plus" />,
    bolt: <Icon name="nf-md-flash" />,
    key: <Icon name="nf-md-key" />,
    search: <Icon name="nf-md-magnify" />,
    copy: <Icon name="nf-md-content_copy" />,
    eye: <Icon name="nf-md-eye" />,
    eyeOff: <Icon name="nf-md-eye_off" />,
    trash: <Icon name="nf-md-delete" />,
    back: <Icon name="nf-md-arrow_left" />,
    link: <Icon name="nf-md-link" />
} as const;

export const CategoryIcons: Record<string, JSX.Element> = {
    Entertainment: <Icon name="nf-md-movie" />,
    Shopping: <Icon name="nf-md-cart" />,
    Work: <Icon name="nf-md-briefcase" />,
    Finance: <Icon name="nf-md-credit_card" />,
    "Social Media": <Icon name="nf-md-forum" />,
    Other: <Icon name="nf-md-shape" />
};
