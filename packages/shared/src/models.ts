export type ModelPricing = {
  inputUsdPerMillionToken : number,
  outputUsdPerMillionToken : number
}

export type SupportedProvider = "anthropic" |  "openai" | "google";

type SupportedChatModelDefinion = {
  id: string;
  provider: SupportedProvider;
  pricing: ModelPricing
}


export const  SUPPORTED_CHAT_MODELS = [
  {
    id: "claude-sonnet-4-6",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 3,
      outputUsdPerMillionToken: 15
    }
  },
  {
    id: "claude-opus-5-5",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 4,
      outputUsdPerMillionToken: 20
    }
  },
  {
    id: "claude-sonnet-5-5",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 2,
      outputUsdPerMillionToken: 10
    }
  },
  {
    id: "claude-fable-5-1",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 10,
      outputUsdPerMillionToken: 50
    }
  },
  {
    id: "claude-haiku-5-5",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 0.10,
      outputUsdPerMillionToken: 0.50
    }
  },
  {
    id: "claude-haiku-5-5",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 0.10,
      outputUsdPerMillionToken: 0.50
    }
  },
  {
    id: "gpt-5.6-sol",
    provider: "openai",
    pricing: {
      inputUsdPerMillionToken: 4,
      outputUsdPerMillionToken: 20
    }
  },
  {
    id: "gpt-5.4",
    provider: "openai",
    pricing: {
      inputUsdPerMillionToken: 2.50,
      outputUsdPerMillionToken: 15
    }
  },
  {
    id: "gpt-5.4-mini",
    provider: "openai",
    pricing: {
      inputUsdPerMillionToken: 0.75,
      outputUsdPerMillionToken: 4.50
    }
  },
  {
    id: "gemini-3.6-flash",
    provider: "google",
    pricing: {
      inputUsdPerMillionToken: 0.75,
      outputUsdPerMillionToken: 3.75
    }
  },
  {
    id: "gemini-3.5-flash-lite",
    provider: "google",
    pricing: {
      inputUsdPerMillionToken: 0.30,
      outputUsdPerMillionToken: 2.50
    }
  },
]as const  satisfies readonly SupportedChatModelDefinion[];


export type SupportedChatModel = (typeof SUPPORTED_CHAT_MODELS)[number];  
export type SupportedChatModelId = SupportedChatModel["id"]  

export function findSupportedChatModel(modelId: string){
  return SUPPORTED_CHAT_MODELS.find((model)=> model.id === modelId)
}

export const DEFAULT_CHAT_MODEL_ID: SupportedChatModelId = "gemini-3.5-flash-lite"