import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all appointments for this user
    const appointments = await base44.entities.Appointment.filter({ user_id: user.id });
    const now = new Date();
    const sent = [];

    for (const appt of appointments) {
      // Skip completed/cancelled tasks
      if (appt.status === 'completed' || appt.status === 'cancelled') continue;

      // Parse appointment date
      const apptDate = new Date(appt.date + 'T' + (appt.time || '09:00'));
      
      // Check if task has reminders configured
      if (!appt.reminder_times || appt.reminder_times.length === 0) continue;

      const reminders_sent = appt.reminders_sent || [];

      for (const reminder of appt.reminder_times) {
        const reminderTime = apptDate.getTime() - (reminder.value * 60 * 60 * 1000);
        const reminderDate = new Date(reminderTime);

        // Check if reminder should be sent (within 10 minute window)
        const timeDiff = Math.abs(now.getTime() - reminderDate.getTime());
        const isTimeToSend = timeDiff < (10 * 60 * 1000);

        // Check if this reminder was already sent
        const alreadySent = reminders_sent.some(r => r.hours_before === reminder.value);

        if (isTimeToSend && !alreadySent) {
          // Send email reminder
          if (reminder.type === 'email') {
            const hoursText = reminder.value === 24 ? '1 day' : `${reminder.value} hour${reminder.value > 1 ? 's' : ''}`;
            await base44.integrations.Core.SendEmail({
              to: user.email,
              subject: `Reminder: ${appt.title} due in ${hoursText}`,
              body: `Hi ${user.full_name},\n\nThis is a reminder that your task "${appt.title}" is due in ${hoursText}.\n\nScheduled for: ${appt.date}${appt.time ? ' at ' + appt.time : ''}\n\n${appt.provider_name ? 'Provider: ' + appt.provider_name + '\n' : ''}${appt.notes ? 'Notes: ' + appt.notes : ''}`
            });
          }

          // Track reminder as sent
          reminders_sent.push({
            hours_before: reminder.value,
            sent_at: now.toISOString()
          });

          sent.push(`${appt.title} - ${reminder.value}h reminder`);
        }
      }

      // Update appointment with sent reminders
      if (sent.length > 0) {
        await base44.entities.Appointment.update(appt.id, { reminders_sent });
      }
    }

    return Response.json({ success: true, reminders_sent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});