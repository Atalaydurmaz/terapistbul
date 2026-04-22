import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  // iyzipay dinamik require ile Iyzipay.js içinde resources/*.js dosyalarını yüklüyor —
  // Turbopack bunu bundle edemiyor. Server external olarak işaretleyip runtime'da
  // doğrudan require edilmesini sağlıyoruz.
  serverExternalPackages: ['iyzipay'],
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
