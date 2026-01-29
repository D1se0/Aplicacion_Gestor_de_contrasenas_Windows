export type ToastKind = "info" | "ok" | "error";

export type Toast = {
    id: string;
    kind: ToastKind;
    title: string;
    message?: string;
    createdAt: number;
};
