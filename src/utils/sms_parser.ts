export const extractAmountAndDate = (
  text: string
): { amount: string | null; date: string | null; merchant: string | null; transactionType: string | null; balance: string | null } => {
  // Normalize text: remove extra spaces, convert to lowercase
  const normalizedText = text.replace(/\s+/g, ' ').toLowerCase();

  // Enhanced regex for amounts in various currencies and formats
  const amountRegex = /(?:(?:\$|€|£|¥|₹|Rs\.?|د\.إ\.?|IQD|AED|USD|EUR|GBP|JPY|INR)\s?)?(?:\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?|[٠-٩]+(?:٫[٠-٩]{1,3})?)\s?(?:USD|EUR|GBP|JPY|INR|AED|IQD)?/gi;
  const amountMatches = normalizedText.match(amountRegex);
  
  let amount: string | null = null;
  let balance: string | null = null;

  if (amountMatches && amountMatches.length > 0) {
    // Find the amount associated with transaction keywords
    const transactionAmount = amountMatches.find(match => 
      /(?:spent|paid|debit|credit|received|withdrawn|deposited)/i.test(normalizedText.split(match)[0])
    );
    amount = transactionAmount || amountMatches[0];
    
    // Find balance, usually prefixed with "balance" or at the end
    const balanceAmount = amountMatches.find(match => 
      /(?:balance|available|remaining)/i.test(normalizedText.split(match)[0])
    );
    balance = balanceAmount || (amountMatches.length > 1 ? amountMatches[amountMatches.length - 1] : null);
  }

  // Enhanced regex for dates, including various formats and languages
  const dateRegex = /\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|[٠-٩]{1,2}[-/.][٠-٩]{1,2}[-/.][٠-٩]{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}|\d{1,2} (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4})\b/i;
  const dateMatch = normalizedText.match(dateRegex);
  let date = dateMatch ? dateMatch[0] : null;

  // If no date found, try to extract relative dates
  if (!date) {
    const relativeDateRegex = /(?:today|yesterday|tomorrow|on \d{1,2}(?:st|nd|rd|th)?|last (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i;
    const relativeDateMatch = normalizedText.match(relativeDateRegex);
    date = relativeDateMatch ? relativeDateMatch[0] : null;
  }

  // Enhanced regex for merchant names
  const merchantRegex = /(?:at|to|from|by|via)\s+([a-z0-9\s&'.]+)(?=\s|$)|(?<=paid to )([a-z0-9\s&'.]+)(?=\s|$)|(?<=purchase at )([a-z0-9\s&'.]+)(?=\s|$)/i;
  const merchantMatch = normalizedText.match(merchantRegex);
  const merchant = merchantMatch ? merchantMatch[1] || merchantMatch[2] || merchantMatch[3] : null;

  // Universal transaction type detection
  const transactionTypeKeywords = {
    debit: ['purchase', 'payment', 'spent', 'paid', 'debit', 'withdraw', 'charge', 'خصم', 'سحب', 'دفع', 'شراء', 'transaction', 'fee', 'expense', 'cost', 'bill', 'invoice', 'outgoing', 'transfer out', 'sent', 'مصروف', 'تكلفة', 'فاتورة', 'رسوم', 'تحويل خارج', 'اقتطاع'],
    credit: ['deposit', 'credit', 'received', 'refund', 'cashback', 'reimbursement', 'إيداع', 'ائتمان', 'استلام', 'استرداد']
  };

  let transactionType: string | null = null;
  for (const [type, keywords] of Object.entries(transactionTypeKeywords)) {
    if (keywords.some(keyword => normalizedText.includes(keyword))) {
      transactionType = type;
      break;
    }
  }

  // Handle specific phrases in various languages
  const balanceKeywords = ['balance', 'available', 'remaining', 'saldo', 'solde', 'guthaben', '余额', 'शेष', 'الرصيد'];
  const balanceRegex = new RegExp(`(${balanceKeywords.join('|')})[:\\s]+([\\d,.]+)`, 'i');
  const balanceMatch = normalizedText.match(balanceRegex);
  if (balanceMatch) {
    balance = balanceMatch[2];
  }

  // Convert Arabic numerals to standard numerals if present
  const arabicToEnglish: { [key: string]: string } = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
  if (amount) amount = amount.replace(/[٠-٩]/g, match => arabicToEnglish[match] || match);
  if (balance) balance = balance.replace(/[٠-٩]/g, match => arabicToEnglish[match] || match);
  if (date) date = date.replace(/[٠-٩]/g, match => arabicToEnglish[match] || match);

  return { amount, date, merchant, transactionType, balance };
};