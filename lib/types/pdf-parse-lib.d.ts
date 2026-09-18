// pdf-parse's package-level types only cover its top-level "pdf-parse"
// entry — the one with the require-time debug self-test that crashes
// under bundling (see app/api/intel/congress-trades/route.ts). This
// declares the inner lib file that's actually imported instead.
declare module "pdf-parse/lib/pdf-parse.js" {
  function pdfParse(dataBuffer: Buffer): Promise<{ text: string; numpages: number }>;
  export default pdfParse;
}
