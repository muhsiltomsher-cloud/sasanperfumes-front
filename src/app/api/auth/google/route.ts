import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { API_BASE, backendPostHeaders, noCacheUrl, safeJsonResponse } from "@/lib/utils/backendFetch";
import { checkRateLimit, rateLimitResponse, API_RATE_LIMIT } from "@/lib/security";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface WcCreds {
  key: string;
  secret: string;
  source: string;
}

function getAllWcCredentials(): WcCreds[] {
  const creds: WcCreds[] = [];
  const k1 = process.env.WC_CONSUMER_KEY;
  const s1 = process.env.WC_CONSUMER_SECRET;
  if (k1 && s1) creds.push({ key: k1, secret: s1, source: "WC_CONSUMER_KEY" });

  const k2 = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
  const s2 = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
  if (k2 && s2 && k2 !== k1) creds.push({ key: k2, secret: s2, source: "NEXT_PUBLIC_WC_CONSUMER_KEY" });

  return creds;
}

interface GoogleTokenInfo {
  aud?: string | string[];
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  error_description?: string;
  iss?: string;
  exp?: number | string;
  azp?: string;
}

function decodeJwtPayload(token: string): GoogleTokenInfo | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const payload = Buffer.from(b64, "base64").toString("utf-8");
    return JSON.parse(payload) as GoogleTokenInfo;
  } catch {
    return null;
  }
}

function audienceMatches(aud: string | string[] | undefined, clientId: string): boolean {
  if (!aud) return false;
  if (Array.isArray(aud)) return aud.includes(clientId);
  return aud === clientId;
}

function verifyGoogleToken(credential: string, clientId: string): { valid: boolean; info: GoogleTokenInfo | null; error?: string } {
  const decoded = decodeJwtPayload(credential);
  if (!decoded) {
    console.error(`[google-auth] Failed to decode JWT. Token length=${credential.length}, parts=${credential.split(".").length}`);
    return { valid: false, info: null, error: "Failed to decode Google token" };
  }

  console.warn(`[google-auth] Token decoded: iss=${decoded.iss}, aud=${JSON.stringify(decoded.aud)}, azp=${decoded.azp}, sub=${decoded.sub ? "present" : "missing"}, email=${decoded.email ? "present" : "missing"}, exp=${decoded.exp}`);

  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (!decoded.iss || !validIssuers.includes(decoded.iss)) {
    console.error(`[google-auth] Invalid issuer: ${decoded.iss}`);
    return { valid: false, info: null, error: "Invalid token issuer" };
  }
  if (!audienceMatches(decoded.aud, clientId) && decoded.azp !== clientId) {
    console.error(`[google-auth] Audience mismatch: aud=${JSON.stringify(decoded.aud)}, azp=${decoded.azp}, expected=${clientId}`);
    return { valid: false, info: null, error: "Token audience mismatch" };
  }
  const expNum = typeof decoded.exp === "string" ? parseInt(decoded.exp, 10) : decoded.exp;
  if (expNum && expNum * 1000 < Date.now()) {
    console.error(`[google-auth] Token expired: exp=${expNum}, now=${Math.floor(Date.now() / 1000)}`);
    return { valid: false, info: null, error: "Token expired" };
  }
  if (!decoded.email || !decoded.sub) {
    console.error(`[google-auth] Missing fields: email=${!!decoded.email}, sub=${!!decoded.sub}`);
    return { valid: false, info: null, error: "Token missing required fields" };
  }

  const normalizedAud = Array.isArray(decoded.aud) ? decoded.aud[0] : decoded.aud;
  return { valid: true, info: { ...decoded, aud: normalizedAud } };
}

interface WcCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
}

function getSocialPassword(googleUserId: string): string {
  const secret = process.env.SOCIAL_LOGIN_SECRET || process.env.WC_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET || "sasanperfumes-social-default";
  return crypto.createHmac("sha256", secret).update(`google:${googleUserId}`).digest("hex");
}

function wcApiUrl(path: string): string {
  return `${API_BASE}/wp-json/wc/v3${path}`;
}

function wcAuthHeaders(creds: WcCreds): HeadersInit {
  const encoded = Buffer.from(`${creds.key}:${creds.secret}`).toString("base64");
  return {
    "Authorization": `Basic ${encoded}`,
    "Content-Type": "application/json",
  };
}

export async function POST(request: NextRequest) {
  const rateLimitResult = checkRateLimit(request, API_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult.resetTime);
  }

  try {
    const body = await request.json();
    const credential = body.credential as string;

    if (!credential) {
      return NextResponse.json(
        { success: false, error: { code: "missing_credential", message: "Google credential is required" } },
        { status: 400 }
      );
    }

    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { success: false, error: { code: "config_error", message: "Google Sign-In is not configured" } },
        { status: 500 }
      );
    }

    const allCreds = getAllWcCredentials();
    if (allCreds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "config_error", message: "WooCommerce API credentials are not configured" } },
        { status: 500 }
      );
    }

    const verification = verifyGoogleToken(credential, GOOGLE_CLIENT_ID);
    if (!verification.valid || !verification.info) {
      return NextResponse.json(
        { success: false, error: { code: "invalid_token", message: verification.error || "Invalid Google token" } },
        { status: 401 }
      );
    }

    const tokenInfo = verification.info;
    const email = tokenInfo.email;
    const googleUserId = tokenInfo.sub;
    if (!email || !googleUserId) {
      return NextResponse.json(
        { success: false, error: { code: "invalid_token", message: "Google token missing required fields" } },
        { status: 401 }
      );
    }

    const socialPassword = getSocialPassword(googleUserId);
    const socialMeta = [{ key: "_google_social_login", value: "1" }];

    const primaryHeaders = wcAuthHeaders(allCreds[0]);
    let passwordSet = false;
    let wcDiagnostics = "";

    const searchRes = await fetch(
      wcApiUrl(`/customers?email=${encodeURIComponent(email)}`),
      { headers: primaryHeaders }
    );
    let customers: WcCustomer[] = [];

    if (searchRes.ok) {
      try {
        const parsed = await searchRes.json();
        if (Array.isArray(parsed)) customers = parsed;
      } catch {
        // ignore parse errors
      }
    } else {
      const searchErr = await safeJsonResponse(searchRes);
      console.error(`[google-auth] WC customer search failed (${searchRes.status}):`, searchErr);
      wcDiagnostics += `search_failed(${searchRes.status}); `;
    }

    if (customers.length === 0 && !wcDiagnostics.includes("search_failed")) {
      const roleSearchRes = await fetch(
        wcApiUrl(`/customers?email=${encodeURIComponent(email)}&role=all`),
        { headers: primaryHeaders }
      );
      if (roleSearchRes.ok) {
        try {
          const roleParsed = await roleSearchRes.json();
          if (Array.isArray(roleParsed) && roleParsed.length > 0) {
            customers = roleParsed;
            console.warn(`[google-auth] Found user via role=all search (role=${roleParsed[0].role})`);
          }
        } catch {
          // ignore parse errors
        }
      }
    }

    if (customers.length > 0) {
      const customer = customers[0];
      for (const creds of allCreds) {
        const headers = wcAuthHeaders(creds);
        try {
          const updateRes = await fetch(wcApiUrl(`/customers/${customer.id}`), {
            method: "PUT",
            headers,
            body: JSON.stringify({ password: socialPassword, meta_data: socialMeta }),
          });
          if (updateRes.ok) {
            passwordSet = true;
            console.warn(`[google-auth] Password set via ${creds.source} (key=${creds.key.slice(0, 10)}...)`);
            break;
          }
          const errBody = await safeJsonResponse(updateRes);
          console.error(`[google-auth] Password update failed with ${creds.source} (${updateRes.status}):`, errBody);
        } catch (err) {
          console.error(`[google-auth] Password update error with ${creds.source}:`, err);
        }
      }
      if (!passwordSet) {
        wcDiagnostics += `update_failed(customer=${customer.id}, tried=${allCreds.length} keys); `;
      }
    } else {
      const displayName = tokenInfo.name || tokenInfo.given_name || email.split("@")[0];
      let created = false;
      let customerExists = false;
      for (const creds of allCreds) {
        const headers = wcAuthHeaders(creds);
        try {
          const createRes = await fetch(wcApiUrl("/customers"), {
            method: "POST",
            headers,
            body: JSON.stringify({
              email,
              first_name: tokenInfo.given_name || displayName,
              last_name: tokenInfo.family_name || "",
              username: email,
              password: socialPassword,
              meta_data: socialMeta,
            }),
          });
          if (createRes.ok) {
            created = true;
            passwordSet = true;
            console.warn(`[google-auth] Customer created via ${creds.source}`);
            break;
          }
          const errData = await safeJsonResponse(createRes);
          const errCode = String(errData.code || "");
          console.error(`[google-auth] Customer create failed with ${creds.source} (${createRes.status}):`, errData);
          if (errCode.includes("existing") || errCode === "registration-error-email-exists") {
            customerExists = true;
            break;
          }
        } catch (err) {
          console.error(`[google-auth] Customer create error with ${creds.source}:`, err);
        }
      }

      if (!created && customerExists) {
        const retrySearch = await fetch(
          wcApiUrl(`/customers?email=${encodeURIComponent(email)}&role=all`),
          { headers: primaryHeaders }
        );
        if (retrySearch.ok) {
          try {
            const retryParsed = await retrySearch.json();
            if (Array.isArray(retryParsed) && retryParsed.length > 0) {
              const existingCustomer = retryParsed[0] as WcCustomer;
              for (const creds of allCreds) {
                const headers = wcAuthHeaders(creds);
                try {
                  const retryUpdate = await fetch(wcApiUrl(`/customers/${existingCustomer.id}`), {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ password: socialPassword, meta_data: socialMeta }),
                  });
                  if (retryUpdate.ok) {
                    passwordSet = true;
                    console.warn(`[google-auth] Password set on retry via ${creds.source}`);
                    break;
                  }
                } catch {
                  // continue to next creds
                }
              }
            }
          } catch {
            wcDiagnostics += "retry_parse_error; ";
          }
        }
      }
      if (!created && !passwordSet) {
        wcDiagnostics += `create_failed(tried=${allCreds.length} keys); `;
      }
    }

    if (!passwordSet) {
      console.warn(`[google-auth] Could not set social password. Diagnostics: ${wcDiagnostics}. Creds: ${allCreds.map(c => c.source + "=" + c.key.slice(0, 10) + "...").join(", ")}`);
    }

    const loginRes = await fetch(noCacheUrl(`${API_BASE}/wp-json/cocart/v2/login`), {
      method: "POST",
      headers: backendPostHeaders(),
      body: JSON.stringify({ username: email, password: socialPassword }),
    });
    const loginData = await safeJsonResponse(loginRes);

    if (!loginRes.ok) {
      const errorDetail = !passwordSet
        ? ` WC password could not be set (${wcDiagnostics.trim() || "unknown"}). Ensure WC API key has Read/Write permissions.`
        : "";
      return NextResponse.json(
        {
          success: false,
          error: {
            code: String(loginData.code || "login_failed"),
            message: String(loginData.message || "Authentication failed after Google sign-in") + errorDetail,
          },
          _debug: {
            passwordSet,
            wcDiagnostics: wcDiagnostics.trim() || "none",
            credsAvailable: allCreds.map(c => c.source).join(", "),
          },
        },
        { status: loginRes.status }
      );
    }

    let wpToken: string | undefined;
    try {
      const wpRes = await fetch(noCacheUrl(`${API_BASE}/wp-json/jwt-auth/v1/token`), {
        method: "POST",
        headers: backendPostHeaders(),
        body: JSON.stringify({ username: email, password: socialPassword }),
      });
      if (wpRes.ok) {
        const wpData = await safeJsonResponse(wpRes);
        wpToken = wpData.token as string;
      }
    } catch {
      // WP JWT token is optional
    }

    return NextResponse.json({
      success: true,
      user: {
        token: String((loginData.extras as Record<string, unknown>)?.jwt_token || loginData.jwt_token || loginData.token || ""),
        wp_token: wpToken,
        refresh_token: String((loginData.extras as Record<string, unknown>)?.jwt_refresh || loginData.jwt_refresh_token || loginData.refresh_token || ""),
        user_id: parseInt(String(loginData.user_id || "0")) || (loginData.id as number) || 0,
        user_email: String(loginData.email || loginData.user_email || email),
        user_nicename: String(loginData.user_nicename || loginData.nicename || loginData.username || email),
        user_display_name: String(loginData.display_name || loginData.user_display_name || loginData.username || tokenInfo.name || email),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "server_error",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
