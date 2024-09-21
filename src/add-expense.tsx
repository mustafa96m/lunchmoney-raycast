import { useState } from "react";
import {
  showToast,
  Toast,
  popToRoot,
  showHUD,
  getPreferenceValues,
} from "@raycast/api";
import AddExpenseForm from "./components/AddExpenseForm";
import { Transaction } from "./types";
import { createTransaction } from "./api";
import { Preferences } from "./types";

export default function AddExpense() {
  const [isLoading, setIsLoading] = useState(false);
  const preferences = getPreferenceValues<Preferences>();

  async function handleCreate(transaction: Omit<Transaction, "id" | "status">) {
    setIsLoading(true);
    try {
      await createTransaction(transaction);
      await showHUD("Expense added successfully");
      await popToRoot(); // Navigate back to the root command (index)
    } catch (error) {
      console.error("Failed to create transaction:", error);
      await showHUD("Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AddExpenseForm
      onCreate={handleCreate}
      defaultCurrency={preferences.DEFAULT_CURRENCY}
      isLoading={isLoading}
    />
  );
}
