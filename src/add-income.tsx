import { useState } from "react";
import {
  showToast,
  Toast,
  popToRoot,
  showHUD,
  getPreferenceValues,
} from "@raycast/api";
import AddIncomeForm from "./components/AddIncomeForm";
import { Transaction } from "./types";
import { createTransaction } from "./api";
import { Preferences } from "./types";

export default function AddIncome() {
  const [isLoading, setIsLoading] = useState(false);
  const preferences = getPreferenceValues<Preferences>();

  async function handleCreate(transaction: Omit<Transaction, "id" | "status">) {
    setIsLoading(true);
    try {
      await createTransaction(transaction);
      await showHUD("Income added successfully");
      await popToRoot(); // Navigate back to the root command
    } catch (error) {
      console.error("Failed to create transaction:", error);
      await showToast(Toast.Style.Failure, "Failed to add income");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AddIncomeForm
      onCreate={handleCreate}
      defaultCurrency={preferences.DEFAULT_CURRENCY}
      isLoading={isLoading}
    />
  );
}