# Admin-Lambda

On [carthagenet](https://better-call.dev/carthagenet/KT1CXwj1KVo4LuyzJvbpaMDWrKmPfe7P1ssC/operations):

## Summary

The admin-lambda contract accepts a `lambda` from the `SENDER` in its storage and executes it.
- That lambda may update the allowed-`SENDER` `address` in storage

In other words, this contract is a modification of the
[Generic Multisig](https://github.com/murbard/smart-contracts/blob/master/multisig/michelson/generic.tz)
contract:
- `(unit %default)` is elided
- Only one administrator (so the `threshold = 1`)
- Signatures are replaced with `SENDER` checks
- `change_keys` is integrated into the `lambda` type

### Using Taquito

See the [included taquito package](./taquito/README.md)
for examples of how to use/call this contract using [Taquito](https://github.com/ecadlabs/taquito).

### Emulating FA1.2 Allowance in FA2

See [`README_ALLOWANCE.md`](./README_ALLOWANCE.md)
for a tutorial on using the admin-lambda contract to emulate
[`FA1.2`](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-7/tzip-7.md)-style
allowances in [`FA2`](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md).


## The Contract

```haskell
parameter (lambda address (pair (list operation) address)) ;
storage address ;
code { DUP ;
       CDR ;
       DIP { CAR } ;
       DUP ;
       SENDER ;
       COMPARE ;
       EQ ;
       IF { EXEC } { FAILWITH } }
```

### Generic Multisig Parameters

You can submit Generic Multisig parameters to this contract
by first `APPLY`ing the following lambda:

```haskell
{ UNPAIR; UNIT; EXEC; PAIR }
```

Which has the type:

```haskell
lambda (pair (lambda unit (list operation)) address) (pair (list operation) address)
```

## Origination

```bash
❯❯❯ alpha-client --wait none originate contract AdminLambda \                                                                                                                                                                 $ 
  transferring 0 from $BOB_ADDRESS running \
  "parameter(lambda address(pair(list operation)address));storage address;code{DUP;CDR;DIP{CAR};DUP;SENDER;COMPARE;EQ;IF{EXEC}{FAILWITH}}" \
  --init "\"$BOB_ADDRESS\"" --burn-cap 0.359
Waiting for the node to be bootstrapped before injection...
Current head: BLVyrayYbC4y (timestamp: 2020-08-25T21:21:12-00:00, validation: 2020-08-25T21:21:21-00:00)
Node is bootstrapped, ready for injecting operations.
Estimated gas: 12371 units (will add 100 for safety)
Estimated storage: 359 bytes added (will add 20 for safety)
Operation successfully injected in the node.
Operation hash is 'oohichef1ZYb69MX1RHxUuXpKX4Sqh6HUNwAxRDENpZ5Ebb5j2m'
NOT waiting for the operation to be included.
Use command
  tezos-client wait for oohichef1ZYb69MX1RHxUuXpKX4Sqh6HUNwAxRDENpZ5Ebb5j2m to be included --confirmations 30 --branch BLVyrayYbC4yEBXDAMfFXqjpqAV9bKo6fMsvyTT2V8C5D8KzfnV
and/or an external block explorer to make sure that it has been included.
This sequence of operations was run:
  Manager signed operations:
    From: tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm
    Fee to the baker: ꜩ0.001593
    Expected counter: 624015
    Gas limit: 12471
    Storage limit: 379 bytes
    Balance updates:
      tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ............. -ꜩ0.001593
      fees(tz1Ke2h7sDdakHJQh8WX4Z372du1KChsksyU,327) ... +ꜩ0.001593
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
          KT1CXwj1KVo4LuyzJvbpaMDWrKmPfe7P1ssC
        Storage size: 102 bytes
        Paid storage size diff: 102 bytes
        Consumed gas: 12371
        Balance updates:
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.102
          tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm ... -ꜩ0.257

New contract KT1CXwj1KVo4LuyzJvbpaMDWrKmPfe7P1ssC originated.
Contract memorized as AdminLambda.
```

## Haskell Source

```haskell
adminLambda :: ContractCode (Lambda Address ([Operation], Address)) Address
adminLambda = do
  dup
  cdr
  dip car
  dup
  sender
  eq
  if Holds
     then exec
     else failWith

convertGenericMultisigLambda :: Lambda (Lambda () [Operation], Address) ([Operation], Address)
convertGenericMultisigLambda = do
  unpair
  unit
  exec
  pair
```
