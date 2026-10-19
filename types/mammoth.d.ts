declare module 'mammoth' {
  export interface ConversionMessage {
    type: string;
    message: string;
  }
  export interface ConversionResult {
    value: string;
    messages: ConversionMessage[];
  }
  export interface ConversionOptions {
    styleMap?: string[] | string;
    includeDefaultStyleMap?: boolean;
  }
  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string },
    options?: ConversionOptions
  ): Promise<ConversionResult>;

  export function extractRawText(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string }
  ): Promise<ConversionResult>;
}
