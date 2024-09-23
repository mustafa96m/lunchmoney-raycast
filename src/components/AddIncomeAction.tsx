import { Action, Icon } from "@raycast/api";
import AddIncomeForm from "./AddIncomeForm";
import { Preferences, Transaction } from "../types";
import { getPreferenceValues } from "@raycast/api";

function AddIncomeAction(props: {
  defaultTitle?: string;
  onCreate: (transaction: Omit<Transaction, "id" | "status">) => void;
}) {
  const preferences = getPreferenceValues<Preferences>();

  return (
    <Action.Push
      icon={Icon.Plus}
      title="Add Income"
      shortcut={{ modifiers: ["cmd"], key: "i" }}
      target={
        <AddIncomeForm
          defaultTitle={props.defaultTitle}
          onCreate={props.onCreate}
          defaultCurrency={preferences.DEFAULT_CURRENCY?.toUpperCase() || "USD"}
          isLoading={false}
        />
      }
    />
  );
}

export default AddIncomeAction;