import { NextRequest, NextResponse } from "next/server";
import { baseUrl } from "../../../../utils/baseUrl";
import {
  processSetCookieHeaders,
  toNextResponseCookieOptions,
} from "../../../../utils/cookieHelper";

const BACKEND_URL = baseUrl;

export async function proxyRequest(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  const params = await props.params;
  const path = params.path.join("/");
  const targetUrl = `${BACKEND_URL}/${path}${request.nextUrl.search}`;

  // Prepare headers for backend fetch
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  try {
    // Read body for non-GET requests
    const bodyBuffer =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.arrayBuffer()
        : null;

    // Send request to backend
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: bodyBuffer,
      cache: "no-store",
      credentials: "include",
    });

    // Create proxy response
    const proxyResponse = new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Copy all non-cookie headers
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        proxyResponse.headers.set(key, value);
      }
    });

    // Collect Set-Cookie headers
    const setCookies: string[] = [];
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        setCookies.push(value);
      }
    });

    // Parse Set-Cookie headers into structured objects
    const parsedCookies = processSetCookieHeaders(setCookies);

    // Set cookies on NextResponse (ONLY here!!)
    parsedCookies.forEach((cookie) => {
      try {
        const options = toNextResponseCookieOptions(cookie);

        proxyResponse.cookies.set(cookie.name, cookie.value, options);
      } catch (err) {
        console.error(`❌ Failed to set ${cookie.name}:`, err);
      }
    });

    return proxyResponse;
  } catch (error) {
    console.error("❌ Proxy Error:", error);
    return NextResponse.json(
      { error: "Proxy Internal Server Error" },
      { status: 500 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
