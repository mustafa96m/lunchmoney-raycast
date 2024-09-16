import { ActionPanel, List } from "@raycast/api";
import { Filter, Transaction } from "../types";
import AddExpenseAction from "./AddExpenseAction";

function EmptyView(props: { 
  transactions: Transaction[]; 
  filter: Filter; 
  searchText: string; 
  onCreate: (transaction: Omit<Transaction, "id" | "status">) => void 
}) {
  const { transactions, filter, searchText, onCreate } = props;

  if (transactions.length > 0) {
    return (
      <List.EmptyView
        icon="💸"
        title="No matching expenses found"
        description={`Can't find an expense matching ${searchText}.\nCreate it now!`}
        actions={
          <ActionPanel>
            <AddExpenseAction onCreate={onCreate} />
          </ActionPanel>
        }
      />
    );
  }

  switch (filter) {
    case Filter.Pending: {
      return (
        <List.EmptyView
          icon="💰"
          title="No pending expenses"
          description="All expenses are accounted for. Why not add some more?"
          actions={
            <ActionPanel>
              <AddExpenseAction onCreate={onCreate} />
            </ActionPanel>
          }
        />
      );
    }
    case Filter.Cleared: {
      return (
        <List.EmptyView
          icon="🏷️"
          title="No cleared expenses"
          description="Looks like you haven't cleared any expenses yet."
        />
      );
    }
    case Filter.All:
    default: {
      return (
        <List.EmptyView
          icon="💼"
          title="No Expenses Found"
          description="You don't have any expenses yet. Why not add some?"
          actions={
            <ActionPanel>
              <AddExpenseAction onCreate={onCreate} />
            </ActionPanel>
          }
        />
      );
    }
  }
}

export default EmptyView;