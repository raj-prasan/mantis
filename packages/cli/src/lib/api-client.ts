import {hc} from "hono/client"
import type {AppType} from "@mantis/server"

export const apiClient = hc<AppType>(process.env.API_URL ?? "https://mantis-vw0l.onrender.com")