import {
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
  handleImageOptimization,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

type HandlerEnvironment = NonNullable<Parameters<typeof handler.fetch>[1]>;
type HandlerContext = Parameters<typeof handler.fetch>[2];

interface ImagePipelineResult {
  response(): Response;
}

interface ImagePipeline {
  transform(options: { width?: number }): ImagePipeline;
  output(options: {
    format: string;
    quality: number;
  }): Promise<ImagePipelineResult>;
}

type WorkerEnvironment = HandlerEnvironment & {
  ASSETS: {
    fetch(request: Request): Promise<Response> | Response;
  };
  IMAGES: {
    input(body: ReadableStream): ImagePipeline;
  };
};

const worker = {
  async fetch(
    request: Request,
    env: WorkerEnvironment,
    ctx: HandlerContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/words") {
      url.pathname = "/words/";
      return Response.redirect(url, 308);
    }

    if (url.pathname.startsWith("/words/")) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", {
          status: 405,
          headers: { Allow: "GET, HEAD" },
        });
      }

      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) {
        if (url.pathname === "/words/service-worker.js") {
          const headers = new Headers(asset.headers);
          headers.set("Cache-Control", "no-cache");
          return new Response(asset.body, {
            status: asset.status, statusText: asset.statusText, headers,
          });
        }
        return asset;
      }

      const isDocument =
        request.headers.get("accept")?.includes("text/html") ||
        request.headers.get("sec-fetch-dest") === "document";
      const hasExtension = /\.[^/]+\/?$/.test(url.pathname);
      const isAssetDirectory = /^\/words\/(?:_nuxt|dicts|list|imgs|sound|libs)\//.test(
        url.pathname,
      );

      if (isDocument && !hasExtension && !isAssetDirectory) {
        const shellUrl = new URL("/words/", request.url);
        return env.ASSETS.fetch(new Request(shellUrl, request));
      }

      return asset;
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset: async (path) =>
            env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES.input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });
            return result.response();
          },
        },
        allowedWidths,
      );
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
