import { NextRequest, NextResponse } from "next/server";
import { baseUrl } from "../../../../utils/baseUrl";
const BACKEND_URL = baseUrl;

async function proxyRequest(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  const path = params.path.join("/");
  const url = `${BACKEND_URL}/${path}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length"); // Let fetch calculate it

  try {
    const bodyBuffer =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.arrayBuffer()
        : null;

    console.log(`Proxying ${request.method} request to: ${url}`);

    // Debug logging for JSON bodies
    if (
      bodyBuffer &&
      headers.get("content-type")?.includes("application/json")
    ) {
      try {
        const bodyText = new TextDecoder().decode(bodyBuffer);
        console.log("Request Body (JSON):", bodyText);
      } catch (error) {
        console.error("Failed to decode JSON body for logging");
      }
    }

    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: bodyBuffer,
      cache: "no-store",
    });

    console.log(`Backend response status: ${response.status}`);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
