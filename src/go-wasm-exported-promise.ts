declare var DecompressionStream: any

export type AuthKeySetForSsh = {
  publicKey: string,
  privateKey: string,
  encrypted: boolean,
};

export type GoWasmExported = {
  panicOnPurpose(): void,
  doSsh(
    // Split into "params" and "functions" for Worker using Comlink. "functions" needs Comlink.proxy()
    params: {
      transport: { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array> },
      termReadable: ReadableStream<string>,
      initialCols: number,
      initialRows: number,
      username: string,
      messagePort: MessagePort,
      authKeySets: AuthKeySetForSsh[],
    },
    functions: {
      termWrite(data: Uint8Array): void,
      onHostKey(arg: { key: { type: string, fingerprint: string }}): Promise<boolean>,
      onPasswordAuth(): Promise<string>,
      getAuthPrivateKeyPassphrase(sha256Fingerprint: string): Promise<string>,
      onAuthSigned(sha256Fingerprint: string): void,
      onConnected(): void,
    },
  ): Promise<void>,

  getAuthPublicKeyType(publicKey: string): Promise<string>,

  generateRsaKeys(keyBits: number): { publicKey: string, privateKey: string },

  generateEd25519Keys(): { publicKey: string, privateKey: string },

  sshSha256Fingerprint(publicKey: string): string,

  sshPrivateKeyIsEncrypted(privateKey: string): boolean,
};

const go = new (globalThis as any).Go();

export const goWasmExportedPromise: Promise<GoWasmExported> = (async () => {
  const exportedPromise = new Promise<GoWasmExported>((resolve) => {
    (globalThis as any).pipingSshGoExportResolve = resolve;
  });
  // TODO: use the same URL
  const wasmGzUrl: string = typeof window === 'undefined' ? "../main.wasm.gz" : "main.wasm.gz";
  const gzRes = await fetch(wasmGzUrl);
  const res = new Response(gzRes.body!.pipeThrough(new DecompressionStream("gzip")), {
    headers: {
      "Content-Type": "application/wasm",
    },
  });
  const result = await WebAssembly.instantiateStreaming(res, go.importObject);
  go.run(result.instance);
  return await exportedPromise;
})();


export function goWasmExisted(): boolean {
  return go.exited ?? false;
}
