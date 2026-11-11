import { db } from "./db.ts"

//export const { Role, Mode, MessageStatus } = db.enums.public;

export type MessageStatus = "complete" | "interrupted";
export type Mode = "build" | "plan";
export type Role = "user" | "assistant" | "error";
