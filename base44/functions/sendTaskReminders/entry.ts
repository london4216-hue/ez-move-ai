import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await base44.entities.Appointment.filter({ user_id: user.id });
    const now = new Date();
    const sent = [];

    for (const appt of appointments) {
      if (appt.status === 'completed' || appt.status === 'cancelled') continue;
      if (!appt.reminder_times || appt.reminder_times.length === 0) continue;

      const apptDate = new Date(appt.date + 'T' + (appt.time || '09:00'));
      const reminders_sent = [...(appt.reminders_sent || [])];
      let apptHadNewReminder = false;

      for (const reminder of appt.reminder_times) {
        const reminderTime = apptDate.getTime() - (reminder.value * 60 * 60 * 1000);
        const timeDiff = Math.abs(now.getTime() - reminderTime);
        const isTimeToSend = timeDiff < (10 * 60 * 1000);
        const alreadySent = reminders_sent.some(r => r.hours_before === reminder.value);

        if (isTimeToSend && !alreadySent) {
          if (reminder.type === 'email') {
            const hoursText = reminder.value === 24 ? '1 day' : `${reminder.value} hour${reminder.value > 1 ? 's' : ''}`;
            await base44.integrations.Core.SendEmail({
              to: user.email,
              subject: `Reminder: ${appt.title} due in ${hoursText}`,
              body: `Hi ${user.full_name},\n\nThis is a reminder that your task "${appt.title}" is due in ${hoursText}.\n\nScheduled for: ${appt.date}${appt.time ? ' at ' + appt.time : ''}\n\n${appt.provider_name ? 'Provider: ' + appt.provider_name + '\n' : ''}${appt.notes ? 'Notes: ' + appt.notes : ''}`
            });
          }

          reminders_sent.push({ hours_before: reminder.value, sent_at: now.toISOString() });
          sent.push(`${appt.title} - ${reminder.value}h reminder`);
          apptHadNewReminder = true;
        }
      }

      // Fix: update per-appointment immediately, not once at the end
      if (apptHadNewReminder) {
        await base44.entities.Appointment.update(appt.id, { reminders_sent });
      }
    }

    return Response.json({ success: true, reminders_sent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});