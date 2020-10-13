

# Allowance from Operators using `AdminLambda`

## Using Taquito

See the [included taquito package](./taquito/README.md)
for examples using [Taquito](https://github.com/ecadlabs/taquito).

## Intro

Note: The following examples use an old implementation that costs
`5` additional bytes of storage. You can find more details
[here](https://github.com/s-zeng/adminLambda-comparison).

The [`AdminLambda`](https://gist.github.com/michaeljklein/a364e6624601f020647bf96e8d4277e0)
contract may be used to emulate allowances in `FA2`.

The `AdminLambda` contract allows its admin to emit any `operation`'s on its
behalf and/or change who the admin is.

This contract can be considered a variant of the
[Generic Multisig contract](https://medium.com/tqtezos/multisig-contracts-from-generic-to-wrapping-906d2a783fd3)
where "_is SENDER the stored address?_" replaces all signature checks.

Suppose Bob holds `100 TK0` tokens and wants to allow `Fred` to transfer up to
`5` of his tokens:

1. Bob creates an `AdminLambda` contract
2. Bob sends `5 TK0` tokens to the `AdminLambda` contract
3. Bob sends a lambda to the `AdminLambda` that makes Fred its operator

Fred may then transfer up to `5 TK0` tokens on Bob' (`AdminLambda` contract's) behalf.

## Examples

[`AdminLambda`](https://better-call.dev/carthagenet/KT1GESj71qmXfFHQZgA3kbK3bPaxiyuhXbcE/operations)

- Origination:
  * Total cost: `0.360593 ꜩ`
  * Storage limit `379 bytes`
- Updating operator:
  * Total cost: `0.087178 ꜩ`
  * Cost to call contract: `~0.037487 ꜩ`
  * Gas consumed calling `AdminLambda`: `83892`

[`FA2`](https://better-call.dev/carthagenet/KT1GESj71qmXfFHQZgA3kbK3bPaxiyuhXbcE/operations)

- Origination:
  * Total cost: `4.470402 ꜩ`
  * Storage limit: `4473 bytes`
- Update operator:
  * Cost to update operator: `~0.049691 ꜩ`
  * Consumed gas: `112781`

## Tutorial

### Originate an `AdminLambda`

Create an `AdminLambda` contract for Bob:

```bash
❯❯❯ alpha-client --wait none originate contract AdminLambda \
  transferring 0 from $BOB_ADDRESS running \
  "parameter(lambda address(pair(list operation)address));storage address;code{DUP;CDR;DIP{CAR};DUP;SENDER;COMPARE;EQ;IF{EXEC}{FAILWITH}}" \
  --init "\"$BOB_ADDRESS\"" --burn-cap 0.359

Waiting for the node to be bootstrapped before injection...
Current head: BLsNWUyXt5oR (timestamp: 2020-09-18T18:26:48-00:00, validation: 2020-09-18T18:26:51-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 12371 units (will add 100 for safety)
Estimated storage: 359 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'oo1sGCzfozpQTNW2GoUwmVFNoy26b66cMrJCuDk2aZsgYU26xvg'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for oo1sGCzfozpQTNW2GoUwmVFNoy26b66cMrJCuDk2aZsgYU26xvg to be included --confirmations 30 --branch BLsNWUyXt5oRgPv2u9VUAxCvrCgnzSkA4PMYqZmz5jB98xFPDx3
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.001593
    Expected counter: 624020
    Gas limit: 12471
    Storage limit: 379 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.001593
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,358) ... +ꜩ0.001593
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        { parameter (lambda address (pair (list operation) address)) ;
          storage address ;
          code { DUP ;
                 CDR ;
                 DIP { CAR } ;
                 DUP ;
                 SENDER ;
                 COMPARE ;
                 EQ ;
                 IF { EXEC } { FAILWITH } } }
        Initial storage: "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm"
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1GESj71qmXfFHQZgA3kbK3bPaxiyuhXbcE
        Storage size: 102 bytes
        Paid storage size diff: 102 bytes
        Consumed gas: 12371
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.102
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1GESj71qmXfFHQZgA3kbK3bPaxiyuhXbcE originated.
Contract memorized as AdminLambda.
```

Make a `bash` variable for it:

```bash
ADMIN_LAMBDA='KT1GESj71qmXfFHQZgA3kbK3bPaxiyuhXbcE'
```

### Originate a `FA2`

See the [`FA2` SmartPy Tutorial](https://assets.tqtezos.com/docs/token-contracts/fa2/1-fa2-smartpy/)
for more detail.

Fetch the contract:

```bash
wget -O fa2_default.tz \
        'https://gitlab.com/smondet/fa2-smartpy/-/raw/a58e9f11/michelson/20200724-170337+0000_8cee712_contract.tz'
```

Originate it with Bob as the admin:

```bash
$ tezos-client --wait none originate contract myfa2 \
               transferring 0 from $BOB_ADDRESS \
               running fa2_default.tz \
               --init "(Pair (Pair \"$BOB_ADDRESS\" (Pair 0 {})) (Pair (Pair Unit {}) (Pair False {})))" \
               --burn-cap 10 \
               --no-print-source

Waiting for the node to be bootstrapped before injection...
Current head: BKuFW2Lm2U7X (timestamp: 2020-09-18T18:31:58-00:00, validation: 2020-09-18T18:32:51-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 130465 units (will add 100 for safety)
Estimated storage: 4453 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'opFFjfYJj13SvsoHo1ZPe6AYCLoaqhB7ujwbkNjeM6kgE5d9KJX'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for opFFjfYJj13SvsoHo1ZPe6AYCLoaqhB7ujwbkNjeM6kgE5d9KJX to be included --confirmations 30 --branch BKuFW2Lm2U7XDrbAjvrsg1tpUrqRFWE3mnN98mtfAAh1DpQsa6g
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.017402
    Expected counter: 624021
    Gas limit: 130565
    Storage limit: 4473 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.017402
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,358) ... +ꜩ0.017402
    Origination:
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      Credit: ꜩ0
      Script:
        { ... }
        Initial storage:
          (Pair (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm" (Pair 0 {}))
                (Pair (Pair Unit {}) (Pair False {})))
        No delegate for this contract
        This origination was successfully applied
        Originated contracts:
          KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT
        Storage size: 4196 bytes
        Updated big_maps:
          New map(18447) of type (big_map nat (pair (nat %token_id)
                (pair (string %symbol)
                      (pair (string %name) (pair (nat %decimals) (map %extras string string))))))
          New map(18446) of type (big_map (pair (address %owner) (address %operator)) unit)
          New map(18445) of type (big_map (pair address nat) nat)
        Paid storage size diff: 4196 bytes
        Consumed gas: 130465
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ4.196
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT originated.
Contract memorized as myfa2.
```

Make a `bash` variable for it:

```bash
FA2_ADDRESS='KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT'
```

Mint `100 TK0` tokens to Bob:

```bash
$ tezos-client transfer 0 from $BOB_ADDRESS to $FA2_ADDRESS \
                --entrypoint mint \
                --arg "(Pair (Pair \"$BOB_ADDRESS\" 100) (Pair \"TK0\" 0))" \
                --burn-cap 3

Waiting for the node to be bootstrapped before injection...
Current head: BLJF7Xu3bjHc (timestamp: 2020-09-18T18:38:28-00:00, validation: 2020-09-18T18:38:41-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 114098 units (will add 100 for safety)
Estimated storage: 163 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'ooFdrXZeF1C4rB56fCkkHdiXXJ1amHX9s8X6NkLTSv52tV99vdK'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for ooFdrXZeF1C4rB56fCkkHdiXXJ1amHX9s8X6NkLTSv52tV99vdK to be included --confirmations 30 --branch BLJF7Xu3bjHchanBUfqoGX96ndm4xUKbpsMkjiPx56ZiM94yeVN
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.011742
    Expected counter: 624022
    Gas limit: 114198
    Storage limit: 183 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.011742
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,358) ... +ꜩ0.011742
    Transaction:
      Amount: ꜩ0
      From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
      To: KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT
      Entrypoint: mint
      Parameter: (Pair (Pair "tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm" 100) (Pair "TK0" 0))
      This transaction was successfully applied
      Updated storage:
        (Pair (Pair 0x0000aad02222472cdf9892a3011c01caf6407f027081 (Pair 1 18445))
              (Pair (Pair Unit 18446) (Pair False 18447)))
      Updated big_maps:
        Set map(18447)[0] to (Pair 0 (Pair "TK0" (Pair "" (Pair 0 {}))))
        Set map(18445)[(Pair 0x0000aad02222472cdf9892a3011c01caf6407f027081 0)] to 100
      Storage size: 4359 bytes
      Paid storage size diff: 163 bytes
      Consumed gas: 114098
      Balance updates:
        tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.163
```

### Use Bob's `AdminLambda` to allow Fred to transfer 5 TK0

Bob transfers `5 TK0` tokens to his `AdminLambda` contract:

```bash
$ tezos-client transfer 0 from $BOB_ADDRESS to $FA2_ADDRESS \
                --entrypoint transfer \
                --arg "{ Pair \"$BOB_ADDRESS\" {Pair \"$ADMIN_LAMBDA\" (Pair 0 5)} }" \
                --burn-cap 3

Waiting for the node to be bootstrapped before injection...
Current head: BLCb9RwbgJEn (timestamp: 2020-09-18T18:41:08-00:00, validation: 2020-09-18T18:41:25-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 116167 units (will add 100 for safety)
Estimated storage: 67 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'ooRvKfWSxSD4CNQXFdLhKuCCLXeztRTaR7kyEWMcivGHAhg12VJ'
Waiting for the operation to be included...

Fatal error:
  transfer simulation failed
```

Bob needs to set his `AdminLambda` contract's operator to Fred.

We'll need a `lambda` with the following type:

```haskell
lambda address (pair [operation] address)
```

The following `lambda`:
- Pushes the `FA2`'s address onto the stack and ensures it has the appropriate
  `update_operators` entrypoint
- Specifies that no Tez are transferred
- Sets the `AdminLambda`'s operator to Fred

```haskell
lambda address (pair [operation] address)
{ PUSH address "$FA2_ADDRESS%update_operators";
  CONTRACT (list (or (pair address address) (pair address address)));
  ASSERT_SOME;
  PUSH mutez 0;
  PUSH (list (or (pair address address) (pair address address))) { Left (Pair "$ADMIN_LAMBDA" "$FRED_ADDRESS") };
  TRANSFER_TOKENS;
  DIP { NIL operation };
  CONS;
  PAIR }
```

Bob submits it to his `AdminLambda`:

```bash
$ tezos-client transfer 0 from $BOB_ADDRESS to $ADMIN_LAMBDA \
  --arg "{ PUSH address \"$FA2_ADDRESS%update_operators\"; \
           CONTRACT (list (or (pair address address) (pair address address))); \
           ASSERT_SOME; \
           PUSH mutez 0; \
           PUSH (list (or (pair address address) (pair address address))) { Left (Pair \"$ADMIN_LAMBDA\" \"$FRED_ADDRESS\") }; \
           TRANSFER_TOKENS; \
           DIP { NIL operation }; \
           CONS; \
           PAIR }" \
  --burn-cap 0.067

Waiting for the node to be bootstrapped before injection...
Current head: BLPdbghJYGqG (timestamp: 2020-09-18T18:58:34-00:00, validation: 2020-09-18T18:58:57-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 196673 units (will add 100 for safety)
Estimated storage: 67 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'onpKzWv3GSs5tMX7GTye4nuuWGKruReuiiNoxmQQY8UsQRW8mXv'
Waiting for the operation to be included...

Fatal error:
  transfer simulation failed
```

### Using Fred's allowance

Fred can now transfer up to `5 TK0` tokens from Bob's `AdminLambda`.

Here, Fred transfers `3 TK0` tokens to Alice:

```bash
$ tezos-client transfer 0 from $FRED_ADDRESS to $FA2_ADDRESS \
                --entrypoint transfer \
                --arg "{ Pair \"$ADMIN_LAMBDA\" {Pair \"$ALICE_ADDRESS\" (Pair 0 3)} }" \
                --burn-cap 3

Waiting for the node to be bootstrapped before injection...
Current head: BKimM9xUsFuN (timestamp: 2020-09-18T19:01:04-00:00, validation: 2020-09-18T19:01:51-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 116978 units (will add 100 for safety)
Estimated storage: 67 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'opRex2AywsXEDBNS7nTCSmvue7pq1TetwG2ZAKaE5Uy382xTwQi'
Waiting for the operation to be included...

Fatal error:
  transfer simulation failed
```

By inspecting the resulting operation hash, we can see that the `AdminLambda`'s
balance of `TK0` tokens is now `2` and Alice's balance `TK0` tokens is now `3`:

```bash
$ get-receipt 'opRex2AywsXEDBNS7nTCSmvue7pq1TetwG2ZAKaE5Uy382xTwQi'

Operation found in block: BLR9Ysf4U9FiSwWafVFZMV3H3GBWRN2h1h9Wxe4MVfq6gJy9Us1 (pass: 3, offset: 0)
Manager signed operations:
  From: tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir
  Fee to the baker: ꜩ0.012075
  Expected counter: 623981
  Gas limit: 117078
  Storage limit: 87 bytes
  Balance updates:
    tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir ............. -ꜩ0.012075
    fees(tz1RomaiWJV3NFDZWTMVR2aEeHknsn3iF5Gi,358) ... +ꜩ0.012075
  Transaction:
    Amount: ꜩ0
    From: tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir
    To: KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT
    Entrypoint: transfer
    Parameter: { Pair "KT1GESj71qmXfFHQZgA3kbK3bPaxiyuhXbcE"
                      { Pair "tz1R3vJ5TV8Y5pVj8dicBR23Zv8JArusDkYr" (Pair 0 3) } }
    This transaction was successfully applied
    Updated storage:
      (Pair (Pair 0x0000aad02222472cdf9892a3011c01caf6407f027081 (Pair 1 18445))
            (Pair (Pair Unit 18446) (Pair False 18447)))
    Updated big_maps:
      Set map(18445)[(Pair 0x00003b5d4596c032347b72fb51f688c45200d0cb50db 0)] to 3
      Set map(18445)[(Pair 0x0153e8f6070e26d6b98f3a2721fdabf3ae353cd8c200 0)] to 2
    Storage size: 4560 bytes
    Paid storage size diff: 67 bytes
    Consumed gas: 116978
    Balance updates:
      tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir ... -ꜩ0.067
```
