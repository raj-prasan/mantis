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
import type {ProviderOptions} from "@ai-sdk/provider-utils"

type anthropicModelId = Extract<SupportedChatModel, { provider: "anthropic" }>["id"];
type openAiModelId = Extract<SupportedChatModel, { provider: "openai" }>["id"];
type googleModelId = Extract<SupportedChatModel, { provider: "google" }>["id"];
type AISDKModelId = Extract<SupportedChatModel, { provider: "ai-sdk" }>["id"];

export type ResolvedModel = {
  model: LanguageModel;
  provider: SupportedProvider;
  modelId: SupportedChatModelId;
  providerOptions?: ProviderOptions
}

function anthropicThinking(budgetTokens: number): ProviderOptions {
  return {
    anthropic: {
      thinking: {
        type: "enabled",
        budgetTokens
      }
    }
  };
}

function openAIReasoning(reasoningEffort: "low" | "medium" | "high"): ProviderOptions {
  return {
    openai: {
      reasoningEffort,
      reasoningSummary: "auto"
    }
  };
}

function googleThinking(thinkingBudget: number): ProviderOptions {
  return {
    google: {
      thinkingConfig: {
        thinkingBudget,
        includeThoughts: true
      }
    }
  };
}

const ANTHROPIC_PROVIDER_OPTIONS: Partial<Record<anthropicModelId, ProviderOptions>> = {
  "claude-sonnet-4-6": anthropicThinking(10000),
  "claude-opus-5-5": anthropicThinking(16000),
  "claude-sonnet-5-5": anthropicThinking(10000),
  "claude-fable-5-1": anthropicThinking(16000)
}

const OPENAI_PROVIDER_OPTIONS: Partial<Record<openAiModelId, ProviderOptions>> = {
  "gpt-5.6-sol": openAIReasoning("medium"),
  "gpt-5.4": openAIReasoning("medium"),
  "gpt-5.4-mini": openAIReasoning("low")
}

const GOOGLE_PROVIDER_OPTIONS: Partial<Record<googleModelId, ProviderOptions>> = {
  "gemini-3.6-flash": googleThinking(8192),
  "gemini-3.5-flash-lite": googleThinking(2048)
}

function assertUnsupportedProvider(provider: never): never {
  throw new Error(`Unsupported provider: ${provider}`);
}

function resolveAnthropicModel(modelId: anthropicModelId): ResolvedModel {
  return {
    model: anthropic(modelId),
    provider: "anthropic",
    modelId,
    providerOptions: ANTHROPIC_PROVIDER_OPTIONS[modelId],
  }
}
function resolveOpenAIModel(modelId: openAiModelId): ResolvedModel {
  return {
    model: openai(modelId),
    provider: "openai",
    modelId,
    providerOptions: OPENAI_PROVIDER_OPTIONS[modelId],
  }
}
function resolveGoogleModel(modelId: googleModelId): ResolvedModel {
  return {
    model: google(modelId),
    provider: "google",
    modelId,
    providerOptions: GOOGLE_PROVIDER_OPTIONS[modelId],
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