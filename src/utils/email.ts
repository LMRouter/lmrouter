// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type { User } from "better-auth";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import { getConfig } from "./config.js";
import { getResend } from "./resend.js";
import type { ContextEnv } from "../types/hono.js";

export const sendVerificationEmail = async (
  user: User,
  url: string,
  c?: Context<ContextEnv>,
) => {
  const cfg = getConfig(c);
  if (!cfg.auth.enabled) {
    throw new HTTPException(400, {
      message: "Auth is not enabled",
    });
  }

  const resend = getResend(c);
  await resend.emails.send({
    from: cfg.auth.email.from_email,
    to: user.email,
    replyTo: cfg.auth.email.reply_to_email,
    subject: `Verify Your LMRouter Account`,
    html: `<!doctype html>
<html lang="en" style="margin:0;padding:0;">
  <head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <title>Verify your LMRouter account</title>
    <style>
      @media (max-width:600px){
        .container{ width:100% !important; }
        .px{ padding-left:20px !important; padding-right:20px !important; }
      }
      a{ text-decoration:none; }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
      Confirm your email to finish setting up LMRouter. This link expires soon.
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f7fb;">
      <tr>
        <td align="center" style="padding:32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;box-shadow:0 4px 16px rgba(18, 23, 34, 0.08);">
            <tr>
              <td class="px" style="padding:16px 32px 0 32px;">
                <h1 style="margin:0;font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;font-size:22px;line-height:1.35;color:#111827;">
                  Verify your LMRouter account
                </h1>
                <p style="margin:12px 0 0 0;font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;font-size:15px;line-height:1.6;color:#374151;">
                  Hi ${user.name}, please verify that <strong style="color:#111827;">${user.email}</strong> is your email address.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" class="px" style="padding:24px 32px 8px 32px;">
                <a href="${url}"
                   target="_blank"
                   rel="noopener"
                   aria-label="Verify your email"
                   style="display:inline-block;background:#6B4EFF;color:#ffffff;border-radius:10px;
                          font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
                          font-size:15px;font-weight:600;line-height:1;padding:14px 22px;">
                  Verify Email
                </a>
              </td>
            </tr>

            <tr>
              <td class="px" style="padding:8px 32px 0 32px;">
                <p style="margin:0;font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.6;color:#6b7280;">
                  For your security, this link may expire after a short time or after it’s used.
                </p>
              </td>
            </tr>

            <tr>
              <td class="px" style="padding:20px 32px 0 32px;">
                <p style="margin:0 0 6px 0;font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;font-size:13px;line-height:1.6;color:#6b7280;">
                  Button not working? Paste this link into your browser:
                </p>
                <div style="word-break:break-all;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;">
                  <a href="${url}" target="_blank" rel="noopener"
                     style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                            font-size:12px;line-height:1.5;color:#4f46e5;">
                    ${url}
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td class="px" style="padding:20px 32px 24px 32px;">
                <p style="margin:0;font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;font-size:12px;line-height:1.6;color:#9ca3af;">
                  If you didn’t create an LMRouter account, you can safely ignore this email.
                  Need help? Reply to this message or contact support.
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="width:600px;max-width:600px;">
            <tr>
              <td align="center" style="padding:16px 12px 0 12px;">
                <p style="margin:0 0 24px 0;font-family:ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;font-size:12px;line-height:1.6;color:#9ca3af;">
                  © ${new Date().getFullYear()} LMRouter · All rights reserved
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`,
  });
};
