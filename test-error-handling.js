#!/usr/bin/env node

/**
 * Error Handling Validation Test
 * Tests error scenarios and validation
 */

import { YnabClient } from './server/ynab-client.js';
import { ParameterProcessor } from './server/utils.js';

console.log('\n🔍 YNAB MCPB - Error Handling Validation\n');
console.log('='.repeat(60));

const apiToken = process.env.YNAB_API_TOKEN;
if (!apiToken) {
  console.error('❌ YNAB_API_TOKEN environment variable not set');
  process.exit(1);
}

let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, message = '') {
  if (passed) {
    console.log(`✅ ${name}${message ? ': ' + message : ''}`);
    testsPassed++;
  } else {
    console.log(`❌ ${name}${message ? ': ' + message : ''}`);
    testsFailed++;
  }
}

async function runTests() {
  const client = new YnabClient(apiToken);

  // Test 1: Invalid budget ID
  console.log('\n1️⃣  Test: Invalid Budget ID');
  console.log('-'.repeat(60));
  try {
    await client.getBudget('invalid-budget-id');
    logTest('Invalid Budget ID', false, 'Should have thrown an error');
  } catch (error) {
    logTest('Invalid Budget ID', error.message.includes('404') || error.message.includes('not found'), 'Correctly rejected');
  }

  // Test 2: Invalid account ID
  console.log('\n2️⃣  Test: Invalid Account ID');
  console.log('-'.repeat(60));
  try {
    await client.getAccount('last-used', 'invalid-account-id');
    logTest('Invalid Account ID', false, 'Should have thrown an error');
  } catch (error) {
    logTest('Invalid Account ID', error.message.includes('404') || error.message.includes('not found'), 'Correctly rejected');
  }

  // Test 3: Date validation
  console.log('\n3️⃣  Test: Date Validation');
  console.log('-'.repeat(60));
  try {
    ParameterProcessor.validateDate('2025-01-32'); // Invalid day
    logTest('Date Validation', false, 'Should have rejected invalid date');
  } catch (error) {
    logTest('Date Validation', error.message.includes('Invalid date'), 'Correctly rejected invalid date');
  }

  // Test 4: Valid date format
  console.log('\n4️⃣  Test: Valid Date Format');
  console.log('-'.repeat(60));
  try {
    const date = ParameterProcessor.validateDate('2025-01-15');
    logTest('Valid Date Format', date === '2025-01-15', 'Accepted valid date');
  } catch (error) {
    logTest('Valid Date Format', false, error.message);
  }

  // Test 5: Amount validation
  console.log('\n5️⃣  Test: Amount Validation');
  console.log('-'.repeat(60));
  try {
    ParameterProcessor.validateAmount('not-a-number');
    logTest('Amount Validation', false, 'Should have rejected invalid amount');
  } catch (error) {
    logTest('Amount Validation', error.message.includes('Invalid amount'), 'Correctly rejected invalid amount');
  }

  // Test 6: Valid amount
  console.log('\n6️⃣  Test: Valid Amount');
  console.log('-'.repeat(60));
  try {
    const amount = ParameterProcessor.validateAmount(45320);
    logTest('Valid Amount', amount === 45320, 'Accepted valid amount');
  } catch (error) {
    logTest('Valid Amount', false, error.message);
  }

  // Test 7: API token not set (using new instance)
  console.log('\n7️⃣  Test: Missing API Token');
  console.log('-'.repeat(60));
  try {
    new YnabClient(null);
    logTest('Missing API Token', false, 'Should have thrown an error');
  } catch (error) {
    logTest('Missing API Token', error.message.includes('API token is required'), 'Correctly rejected');
  }

  // Test 8: Invalid month format
  console.log('\n8️⃣  Test: Get Month with Invalid Format');
  console.log('-'.repeat(60));
  try {
    await client.getMonth('last-used', 'invalid-month');
    logTest('Invalid Month Format', false, 'Should have thrown an error');
  } catch (error) {
    logTest('Invalid Month Format', error.message.includes('404') || error.message.includes('error'), 'Correctly rejected');
  }

  // Test 9: Parameter processing with empty object
  console.log('\n9️⃣  Test: Parameter Processing - Empty Object');
  console.log('-'.repeat(60));
  try {
    const processed = ParameterProcessor.process({});
    logTest('Empty Parameter Object', Object.keys(processed).length === 0, 'Correctly processed empty object');
  } catch (error) {
    logTest('Empty Parameter Object', false, error.message);
  }

  // Test 10: Parameter processing with valid params
  console.log('\n🔟 Test: Parameter Processing - Valid Params');
  console.log('-'.repeat(60));
  try {
    const processed = ParameterProcessor.process({
      date: '2025-01-15',
      amount: 50000,
      memo: 'Test transaction'
    });
    logTest('Valid Parameter Processing',
      processed.date === '2025-01-15' && processed.amount === 50000,
      'Correctly processed valid params');
  } catch (error) {
    logTest('Valid Parameter Processing', false, error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ERROR HANDLING SUMMARY\n');
  console.log(`   ✅ Passed:  ${testsPassed}`);
  console.log(`   ❌ Failed:  ${testsFailed}`);
  console.log(`   📈 Total:   ${testsPassed + testsFailed}`);
  console.log('='.repeat(60));

  if (testsFailed === 0) {
    console.log('\n✨ All error handling tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some error handling tests failed.\n');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('\n💥 Test failed with error:', error.message);
  process.exit(1);
});
