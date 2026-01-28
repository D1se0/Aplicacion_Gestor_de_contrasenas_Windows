export type GeneratorOptions = {
    length: number;
    lower: boolean;
    upper: boolean;
    digits: boolean;
    symbols: boolean;
    avoidAmbiguous: boolean;
};

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/|~";

const AMBIGUOUS = new Set(["O", "0", "I", "l", "1", "S", "5", "B", "8"]);

function pick(set: string, n: number): string {
    const bytes = new Uint32Array(n);
    crypto.getRandomValues(bytes);
    let out = "";
    for (let i = 0; i < n; i++) {
        out += set[bytes[i] % set.length];
    }
    return out;
}

export function generatePassword(opts: GeneratorOptions): string {
    const length = Math.max(4, Math.min(128, Math.floor(opts.length)));

    let pool = "";
    const buckets: string[] = [];
    if (opts.lower) { pool += LOWER; buckets.push(LOWER); }
    if (opts.upper) { pool += UPPER; buckets.push(UPPER); }
    if (opts.digits) { pool += DIGITS; buckets.push(DIGITS); }
    if (opts.symbols) { pool += SYMBOLS; buckets.push(SYMBOLS); }

    if (!pool) throw new Error("Selecciona al menos un tipo de carácter.");

    // Garantiza al menos 1 de cada bucket seleccionado
    const parts: string[] = [];
    for (const b of buckets) parts.push(pick(b, 1));

    parts.push(pick(pool, length - parts.length));

    // Mezcla Fisher-Yates
    const arr = parts.join("").split("");
    const r = new Uint32Array(arr.length);
    crypto.getRandomValues(r);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = r[i] % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    let out = arr.join("");
    if (opts.avoidAmbiguous) {
        out = out.split("").map(ch => AMBIGUOUS.has(ch) ? "x" : ch).join("");
    }
    return out;
}

export function estimateStrength(pw: string): { score: number; warnings: string[] } {
    const warnings: string[] = [];
    let score = 0;

    const len = pw.length;
    score += Math.min(40, len * 2);

    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /\d/.test(pw);
    const hasSym = /[^A-Za-z0-9]/.test(pw);

    const variety = [hasLower, hasUpper, hasDigit, hasSym].filter(Boolean).length;
    score += variety * 15;

    if (len < 12) warnings.push("Longitud recomendada: 12+ caracteres.");
    if (variety <= 2) warnings.push("Mezcla mayúsculas, minúsculas, dígitos y símbolos.");

    if (/^(.)\1+$/.test(pw)) warnings.push("La contraseña repite el mismo carácter.");

    // Penaliza patrones simples
    if (/(1234|abcd|qwer|password|admin)/i.test(pw)) {
        warnings.push("Parece contener un patrón/palabra común.");
        score -= 20;
    }

    score = Math.max(0, Math.min(100, score));
    return { score, warnings };
}
