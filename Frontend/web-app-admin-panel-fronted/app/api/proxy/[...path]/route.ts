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

  console.log("🍪 PROXY COOKIE DEBUG START ==========");
  console.log("Incoming cookies:", request.headers.get("cookie"));

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  try {
    const bodyBuffer =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.arrayBuffer()
        : null;

    const response = await fetch(url, {
      method: request.method,
      headers: headers,
      body: bodyBuffer,
      cache: "no-store",
      credentials: "include",
    });

    console.log(`Backend response status: ${response.status}`);

    // COLLECT ALL SET-COOKIE HEADERS
    const setCookieHeaders: string[] = [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        setCookieHeaders.push(value);
        console.log(`🎯 Backend Set-Cookie: ${value}`);
      }
    });

    console.log(
      `Total Set-Cookie headers from backend: ${setCookieHeaders.length}`
    );

    // Create new response headers
    const responseHeaders = new Headers();

    // Copy all headers EXCEPT set-cookie (we'll handle them separately)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        responseHeaders.set(key, value);
      }
    });

    // MANUALLY ADD ALL SET-COOKIE HEADERS
    setCookieHeaders.forEach((cookie) => {
      responseHeaders.append("set-cookie", cookie); // ← Use APPEND not SET
    });

    // Verify all cookies are preserved
    const finalCookies: string[] = [];
    responseHeaders.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        finalCookies.push(value);
      }
    });

    console.log(`Final Set-Cookie headers to client: ${finalCookies.length}`);
    finalCookies.forEach((cookie, index) => {
      console.log(`Cookie ${index + 1}: ${cookie.substring(0, 80)}...`);
    });

    console.log("🍪 PROXY COOKIE DEBUG END ==========");

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
