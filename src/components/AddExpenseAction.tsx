import { Action, Icon } from "@raycast/api";
import AddExpenseForm from "./AddExpenseForm";
import { Preferences, Transaction } from "../types";
import { getPreferenceValues } from "@raycast/api";

function AddExpenseAction(props: { defaultTitle?: string; onCreate: (transaction: Omit<Transaction, "id" | "status">) => void }) {
  const preferences = getPreferenceValues<Preferences>();

  return (
    <Action.Push
      icon={Icon.Plus}
      title="Add Expense"
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<AddExpenseForm 
        defaultTitle={props.defaultTitle} 
        onCreate={props.onCreate} 
        defaultCurrency={preferences.DEFAULT_CURRENCY?.toUpperCase() || "USD"}
        isLoading={false} // Add this line
      />}
    />
  );
}

export default AddExpenseAction;