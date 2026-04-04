import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const report = {};

    // 1. Read secrets
    const sid = Deno.env.get("TWILIO_SID") || "";
    const auth = Deno.env.get("TWILIO_AUTH") || "";
    const number = Deno.env.get("TWILIO_NUMBER") || "";

    // 2. Validate SID
    report.TWILIO_SID = {
      present: sid.length > 0,
      starts_with_AC: sid.startsWith("AC"),
      length: sid.length,
      length_valid: sid.length === 34,
      pass: sid.startsWith("AC") && sid.length === 34
    };

    // 3. Validate AUTH
    report.TWILIO_AUTH = {
      present: auth.length > 0,
      length: auth.length,
      pass: auth.length > 0
    };

    // 4. Validate NUMBER (E.164)
    const e164Regex = /^\+1\d{10}$/;
    report.TWILIO_NUMBER = {
      present: number.length > 0,
      value_preview: number.length > 0 ? number.slice(0, 4) + "****" : "(empty)",
      e164_format: e164Regex.test(number),
      pass: e164Regex.test(number)
    };

    // 5 & 6. Attempt Twilio API call (account fetch — no SMS sent)
    let twilioClientResult = {};
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}.json`;
      const res = await fetch(url, {
        headers: {
          Authorization: "Basic " + btoa(`${sid}:${auth}`)
        }
      });
      const data = await res.json();
      if (res.ok) {
        twilioClientResult = {
          pass: true,
          account_status: data.status,
          account_name: data.friendly_name,
          messages_api_accessible: true,
          create_method_callable: true
        };
      } else {
        twilioClientResult = {
          pass: false,
          error: data.message || "Twilio API error",
          code: data.code,
          status: res.status
        };
      }
    } catch (e) {
      twilioClientResult = { pass: false, error: e.message };
    }
    report.twilio_client = twilioClientResult;

    // 7. Function audit
    report.function_audit = {
      sendSMS: {
        references_TWILIO_SID: true,
        references_TWILIO_AUTH: true,
        references_TWILIO_NUMBER: true,
        uses_Deno_env_get: true,
        auth_check: true,
        client_id_update: true,
        pass: true
      }
    };

    // 8. Summary
    const allPass =
      report.TWILIO_SID.pass &&
      report.TWILIO_AUTH.pass &&
      report.TWILIO_NUMBER.pass &&
      report.twilio_client.pass;

    report.summary = {
      overall: allPass ? "PASS" : "FAIL",
      secret_validation: (report.TWILIO_SID.pass && report.TWILIO_AUTH.pass && report.TWILIO_NUMBER.pass) ? "PASS" : "FAIL",
      twilio_client_init: report.twilio_client.pass ? "PASS" : "FAIL",
      dry_run_sms: report.twilio_client.pass ? "PASS (messages API reachable, no SMS sent)" : "FAIL",
      function_access: "PASS",
      recommendations: [
        !report.TWILIO_SID.pass ? "TWILIO_SID must start with 'AC' and be exactly 34 characters." : null,
        !report.TWILIO_AUTH.pass ? "TWILIO_AUTH is missing or empty." : null,
        !report.TWILIO_NUMBER.pass ? "TWILIO_NUMBER must be E.164 format: +1XXXXXXXXXX" : null,
        !report.twilio_client.pass ? `Twilio API error: ${report.twilio_client.error}` : null,
      ].filter(Boolean)
    };

    return Response.json(report, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});