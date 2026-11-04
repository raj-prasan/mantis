import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

import {
  DEFAULT_CHAT_MODEL_ID,
  findSupportedChatModel,
  type SupportedChatModel,
  type SupportedChatModelId,
  type SupportedProvider
} from "@mantis/shared"

import type { LanguageModel } from "ai";

type anthropicModelId = Extract<SupportedChatModel, { provider: "anthropic" }>["id"];
type openAiModelId = Extract<SupportedChatModel, { provider: "openai" }>["id"];
type googleModelId = Extract<SupportedChatModel, { provider: "google" }>["id"];
type AISDKModelId = Extract<SupportedChatModel, { provider: "ai-sdk" }>["id"];

export type ResolvedModel = {
  model: LanguageModel;
  provider: SupportedProvider;
  modelId: SupportedChatModelId;
}

function assertUnsupportedProvider(provider: never): never {
  throw new Error(`Unsupported provider: ${provider}`);
}

function resolveAnthropicModel(modelId: anthropicModelId): ResolvedModel {
  return {
    model: anthropic(modelId),
    provider: "anthropic",
    modelId,
  }
}
function resolveOpenAIModel(modelId: openAiModelId): ResolvedModel {
  return {
    model: openai(modelId),
    provider: "openai",
    modelId,
  }
}
function resolveGoogleModel(modelId: googleModelId): ResolvedModel {
  return {
    model: google(modelId),
    provider: "google",
    modelId,
  }
}
function resolveAISDKModel(modelId: AISDKModelId): ResolvedModel {
  return {
    model: modelId,
    provider: "ai-sdk",
    modelId,
  }
}

function resolveSupportedChatModel(model: SupportedChatModel): ResolvedModel {
  const provider = model.provider;

  switch (provider) {
    case "anthropic":
      return resolveAnthropicModel(model.id);
    case "openai":
      return resolveOpenAIModel(model.id);
    case "google":
      return resolveGoogleModel(model.id);
    case "ai-sdk":
      return resolveAISDKModel(model.id);
    default:
      assertUnsupportedProvider(provider);
  }
}

export function isSupportedChatModel(modelId: string): boolean {
  return findSupportedChatModel(modelId) != null;
}

export function resolveChatModel(modelId: string): ResolvedModel {
  const model = findSupportedChatModel(modelId);
  if (!model) {
    throw new Error(`Unsupported model: ${modelId}`);
  }
  return resolveSupportedChatModel(model);
}