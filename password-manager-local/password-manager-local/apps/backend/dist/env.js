import dotenv from "dotenv";
dotenv.config();
function req(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Falta variable de entorno: ${name}`);
    return v;
}
export const ENV = {
    PORT: Number(process.env.PORT ?? "4545"),
    HOST: process.env.HOST ?? "127.0.0.1",
    API_TOKEN: req("API_TOKEN"),
    DB_PATH: process.env.DB_PATH ?? "./data/app.db"
};
