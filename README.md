# Lunch Money for Raycast

This Raycast extension integrates with Lunch Money, a personal finance app that helps you track your spending, manage your budget, and reach your financial goals.

## Features

- View your total spending and today's spending at a glance
- Browse your latest transactions
- See upcoming recurring transactions
- **Add new expenses quickly**
- **Add new income quickly**
- **View and process SMS messages to create transactions**
- Search through your transactions

## Setup

To use this extension, you'll need to obtain a personal API token from Lunch Money:

1. Log in to your Lunch Money account
2. Go to the **Developer** section in your account settings
3. Click on **Create new access token**
4. Give your token a name (e.g., **Raycast Extension**)
5. Copy the generated token

Once you have your API token:

1. Install the **Lunch Money** extension in Raycast
2. Open Raycast and search for **Lunch Money**
3. When prompted, enter your API token
4. Set your preferred default currency

## Usage

After setup, you can use the following commands:

- **`Browse`**: View your spending summary, latest transactions, recurring expenses, and SMS messages
- **`Add Expense`**: Quickly add a new expense
- **`Add Income`**: Quickly add new income
- **`SMS`**: View latest SMS messages and create transactions from them

### To add a new expense:

1. Open the **Lunch Money** extension
2. Use the **Add Expense** action (`Cmd + N`)
3. Fill in the expense details
4. Submit the form

### To add new income:

1. Open the **Lunch Money** extension
2. Use the **Add Income** action (`Cmd + I`)
3. Fill in the income details
4. Submit the form

### To process SMS messages:

1. Open the **Lunch Money** extension
2. Navigate to **SMS Messages**
3. Browse your latest SMS messages
4. Select a message to create a transaction based on its content

## Support

If you encounter any issues or have suggestions for improvements, please file an issue on the [GitHub repository](https://github.com/mustafa96m/raycast-lunchmoney/issues).

## Privacy

This extension only communicates with the Lunch Money API using your personal access token. No data is stored or transmitted elsewhere.

**Note:** When accessing SMS messages, the extension reads SMS data from your local Messages database to help you create transactions quickly. Your SMS data is not transmitted or stored elsewhere.

## License

This project is licensed under the [MIT License](LICENSE).
