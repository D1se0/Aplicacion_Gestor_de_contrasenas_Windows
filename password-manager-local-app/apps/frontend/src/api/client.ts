import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

// Detectar Tauri (dev y release)
const isDesktop = window.location.protocol === "tauri:";

// Backend local
const API_BASE = "http://127.0.0.1:4545";
const API_TOKEN = "local-dev-token";

type HttpResponse = {
    ok: boolean;
    status: number;
    json: () => Promise<any>;
    text: () => Promise<string>;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const url = API_BASE + path;

    const headers = {
        "Content-Type": "application/json",
        "X-API-Token": API_TOKEN
    };

    let res: HttpResponse;

    if (isDesktop) {
        // 👉 Tauri release / dev
        res = await tauriFetch(url, {
            method: init?.method ?? "GET",
            headers,
            body: init?.body
        });
    } else {
        // 👉 Web normal
        const r = await fetch(url, {
            ...init,
            headers
        });

        res = {
            ok: r.ok,
            status: r.status,
            json: () => r.json(),
            text: () => r.text()
        };
    }

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}: ${txt}`);
    }

    return res.json() as Promise<T>;
}

export const Api = {
    // Health
    health: () => api<{ ok: boolean }>("/api/health"),

    // Vaults
    listVaults: () => api<{ vaults: any[] }>("/api/vaults"),

    createVault: (payload: any) =>
        api<{ vault: any }>("/api/vaults", {
            method: "POST",
            body: JSON.stringify(payload)
        }),

    patchVault: (id: string, payload: any) =>
        api<{ vault: any }>(`/api/vaults/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
        }),

    deleteVault: (id: string) =>
        api<{ ok: boolean }>(`/api/vaults/${encodeURIComponent(id)}`, {
            method: "DELETE"
        }),

    // Entries
    listEntries: (vaultId: string) =>
        api<{ entries: any[] }>(
            `/api/vaults/${encodeURIComponent(vaultId)}/entries`
        ),

    createEntry: (payload: any) =>
        api<{ entry: any }>("/api/entries", {
            method: "POST",
            body: JSON.stringify(payload)
        }),

    updateEntry: (id: string, payload: any) =>
        api<{ entry: any }>(`/api/entries/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        }),

    deleteEntry: (id: string) =>
        api<{ ok: boolean }>(`/api/entries/${encodeURIComponent(id)}`, {
            method: "DELETE"
        })
};
