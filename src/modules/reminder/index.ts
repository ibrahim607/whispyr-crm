import { createReminderSchema, listLeadRemindersSchema, listMyRemindersSchema, qstashReminderDueSchema, updateReminderSchema, listAllRemindersSchema } from "./schema";
import { createReminder, fireReminder, listLeadReminders, listMyReminders, cancelReminder, listAllReminders, completeReminder } from "./service";

export const ReminderService = {
    create: createReminder,
    fire: fireReminder,
    listByLead: listLeadReminders,
    listMy: listMyReminders,
    cancel: cancelReminder,
    complete: completeReminder,
    listAll: listAllReminders,
} as const;

export const ReminderSchema = {
    create: createReminderSchema,
    qstash: qstashReminderDueSchema,
    listByLead: listLeadRemindersSchema,
    listMy: listMyRemindersSchema,
    listAll: listAllRemindersSchema,
    update: updateReminderSchema,
} as const;