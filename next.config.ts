import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // RF-10: el límite de subida es 10 MB; se da holgura para el overhead de
    // multipart/form-data y para que los archivos algo mayores lleguen al
    // validador de la acción (que devuelve el mensaje de error en español)
    // en vez de fallar en el framework.
    serverActions: {
      bodySizeLimit: "16mb",
    },
    // El proxy memoriza el cuerpo de la petición; debe superar el límite de
    // las server actions para que ningún cuerpo válido se trunque en silencio.
    proxyClientMaxBodySize: "20mb",
  },
};

export default nextConfig;
