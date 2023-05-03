import { Worker, NearAccount, NEAR } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;
  const contract = await root.createSubAccount('test-account');
  // Get wasm file path from package.json test script in folder above
  await contract.deploy(
    process.argv[2],
  );

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test('Returns the default counter value', async (t) => {

  const { contract } = t.context.accounts
  const counter: number = await contract.view('getCounter', {}); // TODO: how to call method as method of some object, but not a literal string value?

  t.is(counter, 0);

});

test("Increase counter", async (t) => {

  const { root, contract } = t.context.accounts;

  await root.call(contract, "increaseCounter", {});

  const counter: number = await contract.view('getCounter', {});
  t.is(counter, 1);

});

test("Decrease counter", async (t) => {

  const { root, contract } = t.context.accounts;

  await root.call(contract, "increaseCounter", {});
  await root.call(contract, "decreaseCounter", {});

  const counter: number = await contract.view('getCounter', {});
  t.is(counter, 0);

});

test("Deposit for set custom counter value", async (t) => {

  const { root, contract } = t.context.accounts;
  const value: number = 123;

  await root.call(contract, 'setCounter', { value }, { attachedDeposit: NEAR.parse('0.01') });

  const counter: number = await contract.view('getCounter', {});
  t.is(counter, value);

});

test("Reset counter", async (t) => {

  const { root, contract } = t.context.accounts;

  await root.call(contract, 'setCounter', { value: 42 }, { attachedDeposit: NEAR.parse('0.01') });

  let counter: number = await contract.view('getCounter', {});
  t.is(counter, 42);

  await contract.call(contract, 'resetCounter', {});

  counter = await contract.view('getCounter', {});
  t.is(counter, 0);

});
