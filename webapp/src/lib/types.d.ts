interface RawLLMResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: LLMChoice[];
    usage: LLMUsage;
}

interface LLMChoice {
    index: number;
    message: LLMMessage;
    finish_reason: string;
}

interface LLMMessage {
    role: string;
    content: string;
}

interface LLMUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}
