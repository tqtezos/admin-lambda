# admin-lambda

Everyting is inside of [`index.ts`](index.ts)

## Examples

The examples are defined in `admin_lambda_examples`:

```typescript
const admin_lambda_examples = async () => {
  console.log('inside: admin_lambda_examples');

  ...

  console.log('ending: admin_lambda_examples');
};

admin_lambda_examples();
```

If you edit the addresses and use a faucet JSON, you can run `npm test` to
recreate [`test.log`](test.log)

### Validating the contract

```typescript
const admin_lambda_address = 'KT1GESj71qmXfFHQZgA3kbK3bPaxiyuhXbcE';
const admin_lambda_contract = await Tezos.contract.at(admin_lambda_address);
```

#### Check that it's an `admin-lambda` contract

```typescript
console.log('is_admin_lambda_contract:', is_admin_lambda_contract(admin_lambda_contract));
```

`npm test` output:

```bash
is_admin_lambda_contract: true
```

#### Check the stored admin address

Check whether Bob is actually the admin:

```typescript
const storage = await admin_lambda_contract.storage();
console.log('bob is admin:', storage === bob_address);
```

`npm test` output:

```bash
bob is admin: true
```

#### Transfer ownership

Update the `admin-lambda` contract's administrator to `bob_address`:

(This is a no-op since Bob is the current admin)

```typescript
// Update the admin_lambda_contract's admin to bob_address
const update_admin_op = await admin_lambda_contract.methods.main(update_admin_lambda(bob_address)).send();
await update_admin_op.confirmation().then(() => console.log('update_admin_op.hash:', update_admin_op.hash));
```

`npm test` output:

```bash
update_admin_op.hash: ooMWWYcmWVWEN9Gx6kPCqa3PpqzXVMdZhMnVZtu3aM2fguML7qk
```

#### Set FA2 Operator

Update the `admin-lambda` contract's operator to Fred's address on the
FA2 contract:

```typescript
const fred_address = 'tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir';
const fa2_address = 'KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT';
const update_operator_op = await admin_lambda_contract.methods.main(
  update_operators_lambda(admin_lambda_address, fa2_address, fred_address)
).send();
await update_operator_op.confirmation().then(() => console.log('update_operator_op.hash:', update_operator_op.hash));
```

`npm test` output:

```bash
update_operator_op.hash: onoLkcRJjUk9sfmarkJbgMab1u4D1UVqdTARYYCKKwnp7yNuSw4
```

