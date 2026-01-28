const API_BASE = import.meta.env.VITE_API_BASE as string;
const API_TOKEN = import.meta.env.VITE_API_TOKEN as string;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            "X-API-Token": API_TOKEN,
            ...(init?.headers || {})
        }
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`API error ${res.status}: ${txt || res.statusText}`);
    }
    return (await res.json()) as T;
}

export const Api = {
    health: () => api<{ ok: boolean }>("/api/health"),

    listVaults: () => api<{ vaults: any[] }>("/api/vaults"),
    createVault: (payload: any) => api<{ vault: any }>("/api/vaults", { method: "POST", body: JSON.stringify(payload) }),
    patchVault: (id: string, payload: any) =>
        api<{ vault: any }>(`/api/vaults/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteVault: (id: string) => api<{ ok: boolean }>(`/api/vaults/${encodeURIComponent(id)}`, { method: "DELETE" }),

    listEntries: (vaultId: string) =>
        api<{ entries: any[] }>(`/api/vaults/${encodeURIComponent(vaultId)}/entries`),

    createEntry: (payload: any) => api<{ entry: any }>("/api/entries", { method: "POST", body: JSON.stringify(payload) }),
    updateEntry: (id: string, payload: any) =>
        api<{ entry: any }>(`/api/entries/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteEntry: (id: string) => api<{ ok: boolean }>(`/api/entries/${encodeURIComponent(id)}`, { method: "DELETE" })
};
