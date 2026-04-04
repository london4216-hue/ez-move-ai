import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TWILIO_SID = Deno.env.get("TWILIO_SID");
const TWILIO_AUTH = Deno.env.get("TWILIO_AUTH");
const TWILIO_NUMBER = Deno.env.get("TWILIO_NUMBER");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, message, client_id } = await req.json();

    if (!to || !message) {
      return Response.json({ error: "Missing required fields: to, message" }, { status: 400 });
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
    const body = new URLSearchParams({
      From: TWILIO_NUMBER,
      To: to,
      Body: message,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_AUTH}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      // Update client SMS status to failed if client_id provided
      if (client_id) {
        await base44.asServiceRole.entities.Client.update(client_id, {
          sms_status: "failed",
          last_sms_message: message,
          last_sms_sent: new Date().toISOString(),
        });
      }
      return Response.json({ error: data.message || "Twilio error", details: data }, { status: 500 });
    }

    // Update client record with SMS details if client_id provided
    if (client_id) {
      await base44.asServiceRole.entities.Client.update(client_id, {
        sms_status: "sent",
        last_sms_message: message,
        last_sms_sent: new Date().toISOString(),
      });
    }

    return Response.json({ success: true, sid: data.sid });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});