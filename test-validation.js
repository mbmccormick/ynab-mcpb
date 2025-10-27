#!/usr/bin/env node

/**
 * Comprehensive Read-Only Validation Test
 * Tests all major read endpoints with the actual YNAB API
 */

import { YnabClient } from './server/ynab-client.js';
import { YnabLogger } from './server/utils.js';

// Enable debug logging
process.env.DEBUG = 'true';

const TESTS = {
  passed: 0,
  failed: 0,
  skipped: 0
};

function logTest(name, status, message = '') {
  const symbols = { pass: '✅', fail: '❌', skip: '⏭️' };
  console.log(`${symbols[status]} ${name}${message ? ': ' + message : ''}`);
  TESTS[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'skipped']++;
}

async function runValidation() {
  console.log('\n🔍 YNAB MCPB Extension - Comprehensive Validation\n');
  console.log('='.repeat(60));

  // Check API token
  const apiToken = process.env.YNAB_API_TOKEN;
  if (!apiToken) {
    console.error('❌ YNAB_API_TOKEN environment variable not set');
    process.exit(1);
  }

  logTest('API Token Configuration', 'pass', 'Token is set');

  let client;
  let budgetId;

  try {
    // Initialize client
    console.log('\n📡 Initializing YNAB API Client...\n');
    client = new YnabClient(apiToken);
    logTest('Client Initialization', 'pass');
  } catch (error) {
    logTest('Client Initialization', 'fail', error.message);
    process.exit(1);
  }

  // Test 1: Get Budgets
  console.log('\n1️⃣  Testing: get_budgets');
  console.log('-'.repeat(60));
  try {
    const budgets = await client.getBudgets();
    if (budgets && budgets.budgets && budgets.budgets.length > 0) {
      budgetId = budgets.budgets[0].id;
      const budgetName = budgets.budgets[0].name;
      logTest('Get Budgets', 'pass', `Found ${budgets.budgets.length} budget(s)`);
      console.log(`   📊 Using budget: "${budgetName}" (${budgetId})`);
    } else {
      logTest('Get Budgets', 'fail', 'No budgets found');
      process.exit(1);
    }
  } catch (error) {
    logTest('Get Budgets', 'fail', error.message);
    process.exit(1);
  }

  // Test 2: Get Budget Details
  console.log('\n2️⃣  Testing: get_budget');
  console.log('-'.repeat(60));
  try {
    const budget = await client.getBudget(budgetId);
    if (budget && budget.budget) {
      logTest('Get Budget Details', 'pass', `Budget name: ${budget.budget.name}`);
      console.log(`   💰 Currency: ${budget.budget.currency_format?.currency_symbol || 'N/A'}`);
      console.log(`   📅 Last modified: ${budget.budget.last_modified_on}`);
    } else {
      logTest('Get Budget Details', 'fail', 'Invalid budget response');
    }
  } catch (error) {
    logTest('Get Budget Details', 'fail', error.message);
  }

  // Test 3: Get Accounts
  console.log('\n3️⃣  Testing: get_accounts');
  console.log('-'.repeat(60));
  try {
    const accounts = await client.getAccounts(budgetId);
    if (accounts && accounts.accounts) {
      const activeAccounts = accounts.accounts.filter(a => !a.closed && !a.deleted);
      logTest('Get Accounts', 'pass', `Found ${activeAccounts.length} active account(s)`);

      if (activeAccounts.length > 0) {
        const account = activeAccounts[0];
        console.log(`   🏦 Example: ${account.name} (${account.type})`);
        console.log(`   💵 Balance: ${(account.balance / 1000).toFixed(2)}`);
      }
    } else {
      logTest('Get Accounts', 'fail', 'Invalid accounts response');
    }
  } catch (error) {
    logTest('Get Accounts', 'fail', error.message);
  }

  // Test 4: Get Categories
  console.log('\n4️⃣  Testing: get_categories');
  console.log('-'.repeat(60));
  try {
    const categories = await client.getCategories(budgetId);
    if (categories && categories.category_groups) {
      const totalCategories = categories.category_groups.reduce(
        (sum, group) => sum + (group.categories?.length || 0), 0
      );
      logTest('Get Categories', 'pass', `Found ${totalCategories} categories in ${categories.category_groups.length} groups`);

      if (categories.category_groups.length > 0) {
        const group = categories.category_groups[0];
        console.log(`   📁 Example group: ${group.name}`);
      }
    } else {
      logTest('Get Categories', 'fail', 'Invalid categories response');
    }
  } catch (error) {
    logTest('Get Categories', 'fail', error.message);
  }

  // Test 5: Get Transactions (last 30 days)
  console.log('\n5️⃣  Testing: get_transactions');
  console.log('-'.repeat(60));
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sinceDate = thirtyDaysAgo.toISOString().split('T')[0];

    const transactions = await client.getTransactions(budgetId, { since_date: sinceDate });
    if (transactions && transactions.transactions) {
      logTest('Get Transactions', 'pass', `Found ${transactions.transactions.length} transactions (last 30 days)`);

      if (transactions.transactions.length > 0) {
        const tx = transactions.transactions[0];
        console.log(`   💳 Latest: ${tx.payee_name || 'Unknown'} - $${(Math.abs(tx.amount) / 1000).toFixed(2)}`);
        console.log(`   📅 Date: ${tx.date}`);
      }
    } else {
      logTest('Get Transactions', 'fail', 'Invalid transactions response');
    }
  } catch (error) {
    logTest('Get Transactions', 'fail', error.message);
  }

  // Test 6: Get Payees
  console.log('\n6️⃣  Testing: get_payees');
  console.log('-'.repeat(60));
  try {
    const payees = await client.getPayees(budgetId);
    if (payees && payees.payees) {
      const activePayees = payees.payees.filter(p => !p.deleted);
      logTest('Get Payees', 'pass', `Found ${activePayees.length} active payee(s)`);

      if (activePayees.length > 0) {
        console.log(`   👤 Example: ${activePayees[0].name}`);
      }
    } else {
      logTest('Get Payees', 'fail', 'Invalid payees response');
    }
  } catch (error) {
    logTest('Get Payees', 'fail', error.message);
  }

  // Test 7: Get Months
  console.log('\n7️⃣  Testing: get_months');
  console.log('-'.repeat(60));
  try {
    const months = await client.getMonths(budgetId);
    if (months && months.months) {
      logTest('Get Months', 'pass', `Found ${months.months.length} month(s)`);

      if (months.months.length > 0) {
        const currentMonth = months.months[months.months.length - 1];
        console.log(`   📅 Latest month: ${currentMonth.month}`);
      }
    } else {
      logTest('Get Months', 'fail', 'Invalid months response');
    }
  } catch (error) {
    logTest('Get Months', 'fail', error.message);
  }

  // Test 8: Get Current Month
  console.log('\n8️⃣  Testing: get_month (current)');
  console.log('-'.repeat(60));
  try {
    const month = await client.getMonth(budgetId, 'current');
    if (month && month.month) {
      logTest('Get Current Month', 'pass', `Month: ${month.month.month}`);
      console.log(`   💰 To be budgeted: $${(month.month.to_be_budgeted / 1000).toFixed(2)}`);
    } else {
      logTest('Get Current Month', 'fail', 'Invalid month response');
    }
  } catch (error) {
    logTest('Get Current Month', 'fail', error.message);
  }

  // Test 9: Get Scheduled Transactions
  console.log('\n9️⃣  Testing: get_scheduled_transactions');
  console.log('-'.repeat(60));
  try {
    const scheduled = await client.getScheduledTransactions(budgetId);
    if (scheduled && scheduled.scheduled_transactions) {
      logTest('Get Scheduled Transactions', 'pass', `Found ${scheduled.scheduled_transactions.length} scheduled transaction(s)`);

      if (scheduled.scheduled_transactions.length > 0) {
        const st = scheduled.scheduled_transactions[0];
        console.log(`   🔄 Example: ${st.payee_name || 'Unknown'} - ${st.frequency}`);
      }
    } else {
      logTest('Get Scheduled Transactions', 'fail', 'Invalid scheduled transactions response');
    }
  } catch (error) {
    logTest('Get Scheduled Transactions', 'fail', error.message);
  }

  // Test 10: Test with 'last-used' budget ID
  console.log('\n🔟 Testing: last-used budget alias');
  console.log('-'.repeat(60));
  try {
    const budget = await client.getBudget('last-used');
    if (budget && budget.budget) {
      logTest('Last-Used Budget Alias', 'pass', `Resolved to: ${budget.budget.name}`);
    } else {
      logTest('Last-Used Budget Alias', 'fail', 'Could not resolve last-used');
    }
  } catch (error) {
    logTest('Last-Used Budget Alias', 'fail', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION SUMMARY\n');
  console.log(`   ✅ Passed:  ${TESTS.passed}`);
  console.log(`   ❌ Failed:  ${TESTS.failed}`);
  console.log(`   ⏭️  Skipped: ${TESTS.skipped}`);
  console.log(`   📈 Total:   ${TESTS.passed + TESTS.failed + TESTS.skipped}`);
  console.log('='.repeat(60));

  if (TESTS.failed === 0) {
    console.log('\n✨ All tests passed! Extension is ready to use.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run validation
runValidation().catch(error => {
  console.error('\n💥 Validation failed with error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
