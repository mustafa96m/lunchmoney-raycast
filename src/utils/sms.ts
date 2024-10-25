import { homedir } from "os";
import { resolve } from "path";
import { useSQL } from "@raycast/utils";
import { SMSMessage } from "../types";

const DB_PATH = resolve(homedir(), "Library/Messages/chat.db");

function getSMSQuery() {
  return `
    SELECT
      message.guid,
      IFNULL(handle.uncanonicalized_id, chat.chat_identifier) AS sender,
      datetime(message.date / 1000000000 + 978307200, 'unixepoch', 'localtime') AS message_date,
      message.text
    FROM message
      LEFT JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
      LEFT JOIN chat ON chat.ROWID = chat_message_join.chat_id
      LEFT JOIN handle ON message.handle_id = handle.ROWID
    WHERE message.is_from_me = 0
      AND message.text IS NOT NULL
      AND LENGTH(message.text) > 0
    ORDER BY message.date DESC
    LIMIT 100
  `;
}

export function useSMSMessages() {
  const query = getSMSQuery();
  return useSQL<SMSMessage>(DB_PATH, query);
}
