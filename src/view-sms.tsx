import {
  List,
  ActionPanel,
  Action,
  showToast,
  Toast,
  useNavigation,
  LocalStorage,
  popToRoot,
} from "@raycast/api";
import { useSMSMessages } from "./utils/sms";
import { extractAmountAndDate } from "./utils/sms_parser";
import AddExpenseForm from "./components/AddExpenseForm";
import AddIncomeForm from "./components/AddIncomeForm";
import { getPreferenceValues } from "@raycast/api";
import { Preferences, Transaction } from "./types";
import React, { useEffect, useState } from "react";
import { createTransaction } from "./api";

export default function ViewSMSMessages() {
  const { data: messages, isLoading, error } = useSMSMessages();
  const preferences = getPreferenceValues<Preferences>();
  const { push } = useNavigation();

  const [processedMessages, setProcessedMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load processed messages from LocalStorage when the component mounts
    const loadProcessedMessages = async () => {
      try {
        const storedData = await LocalStorage.getItem<string>("processedMessages");
        if (storedData) {
          const parsedData = JSON.parse(storedData) as string[];
          setProcessedMessages(new Set(parsedData));
        }
      } catch (error) {
        console.error("Failed to load processed messages:", error);
      }
    };
    loadProcessedMessages();
  }, []);

  if (error) {
    showToast(Toast.Style.Failure, "Failed to fetch SMS messages", String(error));
  }

  // Utility function to validate date
  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Handler for adding transaction based on SMS content
  const handleAddTransaction = async (msg: any) => {
    const { amount, date, merchant, transactionType, balance } = extractAmountAndDate(msg.text);
    const parsedDate = date && isValidDate(date) ? new Date(date) : undefined;

    try {
      if (transactionType === "debit") {
        // Push AddExpenseForm with real action
        push(
          <AddExpenseForm
            onCreate={async (transaction: Omit<Transaction, "id" | "status">) => {
              try {
                await createTransaction({
                  ...transaction,
                  is_income: false,
                });
                showToast({
                  style: Toast.Style.Success,
                  title: "Expense added successfully",
                });
                // Mark message as processed
                await markMessageAsProcessed(msg.guid);
                popToRoot(); // Navigate back to the root command
              } catch (error) {
                console.error("Failed to create transaction:", error);
                showToast({
                  style: Toast.Style.Failure,
                  title: "Failed to add expense",
                  message: String(error),
                });
              }
            }}
            defaultCurrency={preferences.DEFAULT_CURRENCY.toUpperCase()}
            isLoading={false}
            initialAmount={amount ? parseFloat(amount.replace(/[^0-9.]/g, '')).toString() : "0.00"}
            initialDate={parsedDate?.toISOString()}
            initialPayee={msg.sender}
          />
        );
      } else {
        // Push AddIncomeForm with real action
        push(
          <AddIncomeForm
            onCreate={async (transaction: Omit<Transaction, "id" | "status">) => {
              try {
                await createTransaction({
                  ...transaction,
                  is_income: true,
                });
                showToast({
                  style: Toast.Style.Success,
                  title: "Income added successfully",
                });
                // Mark message as processed
                await markMessageAsProcessed(msg.guid);
                popToRoot(); // Navigate back to the root command
              } catch (error) {
                console.error("Failed to create transaction:", error);
                showToast({
                  style: Toast.Style.Failure,
                  title: "Failed to add income",
                  message: String(error),
                });
              }
            }}
            defaultCurrency={preferences.DEFAULT_CURRENCY.toUpperCase()}
            isLoading={false}
            initialAmount={amount ?? "0.00"}
            initialDate={parsedDate?.toISOString()}
            initialSource={msg.sender}
          />
        );
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error handling transaction",
        message: String(error),
      });
    }
  };

  // Function to mark a message as processed
  const markMessageAsProcessed = async (guid: string) => {
    try {
      const updatedProcessedMessages = new Set(processedMessages);
      updatedProcessedMessages.add(guid);
      setProcessedMessages(updatedProcessedMessages);
      await LocalStorage.setItem("processedMessages", JSON.stringify(Array.from(updatedProcessedMessages)));
    } catch (error) {
      console.error("Failed to mark message as processed:", error);
    }
  };

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search SMS messages">
      {messages && messages.length > 0 ? (
        messages.map((msg) => {
          const { amount, date } = extractAmountAndDate(msg.text);
          const parsedDate = date && isValidDate(date) ? new Date(date) : undefined;
          const isProcessed = processedMessages.has(msg.guid);

          return (
            <List.Item
              key={msg.guid}
              title={msg.sender}
              subtitle={msg.text}
              accessories={[
                isProcessed ? { icon: "✅" } : {},
                {
                  date: parsedDate,
                  tooltip: parsedDate ? parsedDate.toLocaleString() : "Invalid date",
                },
              ]}
              actions={
                <ActionPanel>
                  {!isProcessed && (
                    <Action 
                      title="Add Transaction from SMS" 
                      onAction={() => handleAddTransaction(msg)} 
                    />
                  )}
                </ActionPanel>
              }
            />
          );
        })
      ) : (
        <List.EmptyView title="No SMS messages found." />
      )}
    </List>
  );
}
