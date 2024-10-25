import { List, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useSMSMessages } from "../utils/sms";
import { SMSMessage } from "../types";
import { text } from "node:stream/consumers";

// Add this function to fetch and display the latest SMS messages
function viewLatestSMSMessages() {
  const messages = useSMSMessages(); // Fetch the latest messages
  // Logic to display messages can be added here
}

export default function SMSMessages() {
  const { data: messages, isLoading, error } = useSMSMessages();

  if (error) {
    showToast(Toast.Style.Failure, "Failed to fetch SMS messages", String(error));
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search SMS messages">
      {messages && messages.length > 0 ? (
        messages.map((msg) => (
          <List.Item
            key={msg.guid}
            title={msg.sender}
            subtitle={msg.text}
            accessories={[{ text: new Date(msg.message_date).toLocaleDateString() }]}
            actions={
              <ActionPanel>
                <Action title="Reply" onAction={() => {/* Handle reply action */}} />
                <Action title="View Latest SMS Messages" onAction={viewLatestSMSMessages} />
              </ActionPanel>
            }
          />
        ))
      ) : (
        <List.EmptyView title="No SMS messages found." />
      )}
    </List>
  );
}
