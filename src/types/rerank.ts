export type RerankRequest =
  | JinaRerankRequest
  | CohereRerankV1Request
  | CohereRerankV2Request;

export type RerankResponse =
  | JinaRerankResponse
  | CohereRerankV1Response
  | CohereRerankV2Response;

export interface JinaRerankRequest {
  model: string;
  query:
    | string
    | {
        text?: string;
        image?: string;
      };
  documents:
    | string[]
    | {
        image?: string;
        text?: string;
      }[];
  top_k?: number;
  return_documents: boolean;
}

export interface JinaRerankResponse {
  model: string;
  object: string;
  usage: {
    total_tokens: number;
  };
  results: {
    index: number;
    relevance_score: number;
    document?: string;
  };
}

export interface CohereRerankV1Request {
  model?: string;
  query: string;
  documents: string[];
  top_k?: number;
  rank_fields?: string[];
  return_documents: boolean;
  max_chunks_per_doc?: number;
}

export interface CohereRerankV2Request {
  model: string;
  query: string;
  documents: string[];
  top_k?: number;
  max_tokens_per_doc?: number;
}

export interface CohereRerankV1Response {
  id?: string;
  results: {
    index: number;
    relevance_score: number;
    document?: { text: string };
  }[];
  meta?: {
    api_version?: {
      version: string;
      is_deprecated?: boolean;
      is_experimental?: boolean;
    };
    billed_units?: {
      images?: number;
      input_tokens?: number;
      output_tokens?: number;
      search_units?: number;
      classifications?: number;
    };
    tokens?: {
      input_tokens?: number;
      output_tokens?: number;
    };
    cached_tokens?: number;
    warnings?: string[];
  };
}
export interface CohereRerankV2Response {
  id?: string;
  results: {
    index: number;
    relevance_score: number;
  }[];
  meta?: {
    api_version?: {
      version: string;
      is_deprecated?: boolean;
      is_experimental?: boolean;
    };
    billed_units?: {
      images?: number;
      input_tokens?: number;
      output_tokens?: number;
      search_units?: number;
      classifications?: number;
    };
    tokens?: {
      input_tokens?: number;
      output_tokens?: number;
    };
    cached_tokens?: number;
    warnings?: string[];
  };
}
