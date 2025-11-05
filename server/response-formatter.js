/**
 * Response Formatter
 *
 * Formats large YNAB API responses into concise summaries to avoid
 * exceeding Claude Desktop's 1MB tool result limit and conversation length limits.
 */

import { MilliunitConverter } from "./utils.js";

/**
 * Format budget response (can be 10-20MB)
 */
export function formatBudget(budgetData) {
  const budget = budgetData.budget;

  return {
    budget: {
      id: budget.id,
      name: budget.name,
      last_modified_on: budget.last_modified_on,
      first_month: budget.first_month,
      last_month: budget.last_month,
      currency_format: budget.currency_format,

      // Summary counts instead of full arrays
      accounts_count: budget.accounts?.length || 0,
      categories_count: budget.categories?.length || 0,
      category_groups_count: budget.category_groups?.length || 0,
      payees_count: budget.payees?.length || 0,

      // Note about getting details
      note: "Use get_accounts, get_categories, get_payees, etc. to get detailed information"
    }
  };
}

/**
 * Format accounts response
 */
export function formatAccounts(accountsData) {
  const accounts = accountsData.accounts.filter(a => !a.deleted);

  // Separate on-budget and off-budget
  const onBudget = accounts.filter(a => a.on_budget && !a.closed);
  const offBudget = accounts.filter(a => !a.on_budget && !a.closed);
  const closed = accounts.filter(a => a.closed);

  return {
    summary: {
      total_accounts: accounts.length,
      on_budget_count: onBudget.length,
      off_budget_count: offBudget.length,
      closed_count: closed.length,
      total_on_budget_balance: MilliunitConverter.MilliunitConverter.formatCurrency(onBudget.reduce((sum, a) => sum + a.balance, 0)),
      total_off_budget_balance: MilliunitConverter.MilliunitConverter.formatCurrency(offBudget.reduce((sum, a) => sum + a.balance, 0))
    },
    on_budget_accounts: onBudget.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: MilliunitConverter.formatCurrency(a.balance),
      cleared_balance: MilliunitConverter.formatCurrency(a.cleared_balance),
      uncleared_balance: MilliunitConverter.formatCurrency(a.uncleared_balance),
      direct_import_linked: a.direct_import_linked
    })),
    off_budget_accounts: offBudget.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: MilliunitConverter.formatCurrency(a.balance)
    })),
    note: "Closed accounts not shown. Balances formatted as currency for readability."
  };
}

/**
 * Format categories response
 */
export function formatCategories(categoriesData) {
  const groups = categoriesData.category_groups.filter(g => !g.deleted && !g.hidden);

  return {
    summary: {
      total_groups: groups.length,
      total_categories: groups.reduce((sum, g) => sum + (g.categories?.filter(c => !c.deleted && !c.hidden).length || 0), 0)
    },
    category_groups: groups.map(g => ({
      id: g.id,
      name: g.name,
      hidden: g.hidden,
      categories: g.categories?.filter(c => !c.deleted && !c.hidden).map(c => ({
        id: c.id,
        name: c.name,
        hidden: c.hidden,
        goal_type: c.goal_type
      })) || []
    })),
    note: "Hidden and deleted categories not shown. Use get_category_for_month for budget details."
  };
}

/**
 * Format month response (can be very large with all category details)
 */
export function formatMonth(monthData) {
  const month = monthData.month;
  const categories = month.categories.filter(c => !c.deleted && !c.hidden);

  // Group by category group
  const grouped = {};
  categories.forEach(c => {
    const groupName = c.category_group_name;
    if (!grouped[groupName]) {
      grouped[groupName] = {
        categories: [],
        total_budgeted: 0,
        total_activity: 0,
        total_balance: 0
      };
    }
    grouped[groupName].categories.push({
      id: c.id,
      name: c.name,
      budgeted: MilliunitConverter.formatCurrency(c.budgeted),
      activity: MilliunitConverter.formatCurrency(c.activity),
      balance: MilliunitConverter.formatCurrency(c.balance),
      goal_type: c.goal_type,
      goal_under_funded: c.goal_under_funded
    });
    grouped[groupName].total_budgeted += c.budgeted;
    grouped[groupName].total_activity += c.activity;
    grouped[groupName].total_balance += c.balance;
  });

  // Format group totals
  Object.keys(grouped).forEach(groupName => {
    grouped[groupName].total_budgeted = MilliunitConverter.formatCurrency(grouped[groupName].total_budgeted);
    grouped[groupName].total_activity = MilliunitConverter.formatCurrency(grouped[groupName].total_activity);
    grouped[groupName].total_balance = MilliunitConverter.formatCurrency(grouped[groupName].total_balance);
  });

  return {
    month: month.month,
    summary: {
      income: MilliunitConverter.formatCurrency(month.income),
      budgeted: MilliunitConverter.formatCurrency(month.budgeted),
      activity: MilliunitConverter.formatCurrency(month.activity),
      to_be_budgeted: MilliunitConverter.formatCurrency(month.to_be_budgeted),
      age_of_money: month.age_of_money
    },
    category_groups: grouped,
    note: "Categories grouped for easier reading. All amounts formatted as currency."
  };
}

/**
 * Format transactions response (can be huge)
 */
export function formatTransactions(transactionsData, limit = 50) {
  const transactions = transactionsData.transactions
    .filter(t => !t.deleted)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);

  return {
    summary: {
      total_count: transactionsData.transactions.filter(t => !t.deleted).length,
      showing_count: transactions.length,
      limited: transactionsData.transactions.filter(t => !t.deleted).length > limit
    },
    transactions: transactions.map(t => ({
      id: t.id,
      date: t.date,
      amount: MilliunitConverter.formatCurrency(t.amount),
      payee_name: t.payee_name,
      category_name: t.category_name,
      memo: t.memo,
      approved: t.approved,
      cleared: t.cleared,
      flag_color: t.flag_color
    })),
    note: limit < transactionsData.transactions.filter(t => !t.deleted).length
      ? `Showing most recent ${limit} transactions. Use since_date parameter to filter by date range.`
      : "Showing all transactions matching criteria."
  };
}

/**
 * Format payees response (can be thousands of payees)
 */
export function formatPayees(payeesData, limit = 100) {
  const payees = payeesData.payees
    .filter(p => !p.deleted)
    .slice(0, limit);

  return {
    summary: {
      total_count: payeesData.payees.filter(p => !p.deleted).length,
      showing_count: payees.length,
      limited: payeesData.payees.filter(p => !p.deleted).length > limit
    },
    payees: payees.map(p => ({
      id: p.id,
      name: p.name,
      transfer_account_id: p.transfer_account_id
    })),
    note: limit < payeesData.payees.filter(p => !p.deleted).length
      ? `Showing first ${limit} payees. Use get_payee to get details for a specific payee.`
      : "Showing all payees."
  };
}

/**
 * Format scheduled transactions
 */
export function formatScheduledTransactions(scheduledData) {
  const scheduled = scheduledData.scheduled_transactions.filter(st => !st.deleted);

  return {
    summary: {
      total_count: scheduled.length
    },
    scheduled_transactions: scheduled.map(st => ({
      id: st.id,
      date_first: st.date_first,
      date_next: st.date_next,
      frequency: st.frequency,
      amount: MilliunitConverter.formatCurrency(st.amount),
      payee_name: st.payee_name,
      category_name: st.category_name,
      memo: st.memo
    }))
  };
}

/**
 * Detect if response is too large and needs formatting
 */
export function shouldFormatResponse(data) {
  const jsonSize = JSON.stringify(data).length;
  // Format if over 100KB to stay well under 1MB limit
  return jsonSize > 100000;
}
