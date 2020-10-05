#!/usr/bin/env ts-node

export {};

const { Tezos } = require('@taquito/taquito');
const fs = require("fs");
const bob_address = 'tz1bDCu64RmcpWahdn9bWrDMi6cu7mXZynHm';
const { email, password, mnemonic, secret } =
  JSON.parse(
    fs.readFileSync(require('os').homedir() + '/Downloads/' + bob_address + '.json').toString()
);

Tezos.setProvider({ rpc: 'https://api.tez.ie/rpc/carthagenet' });
Tezos.importKey(email, password, mnemonic.join(" "), secret);

// JSON for the admin-lambda contract
const admin_lambda_json = '[{"prim":"parameter",' +
  '"args":[{"prim":"lambda","args":[{"prim":"address"},' +
  '{"prim":"pair","args":[{"prim":"list","args":[{"prim":"operation"}]},{"prim":"address"}]}]}]},' +
  '{"prim":"storage","args":[{"prim":"address"}]},{"prim":"code","args":[[{"prim":"DUP"},{"prim":"CDR"},' +
  '{"prim":"DIP","args":[[{"prim":"CAR"}]]},{"prim":"DUP"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"},' +
  '{"prim":"IF","args":[[{"prim":"EXEC"}],[{"prim":"FAILWITH"}]]}]]}]';

// Check whether a contract is the admin-lambda contract
const is_admin_lambda_contract = contract => {
  return admin_lambda_json === JSON.stringify(contract.script.code)
};

// The lambda JSON to update the admin of an admin-lambda contract
const update_admin_lambda = new_admin_address => {
  return [
    {
      "prim": "DROP"
    },
    {
      "prim": "PUSH",
      "args": [
        {
          "prim": "address"
        },
        {
          "string": new_admin_address
        }
      ]
    },
    {
      "prim": "NIL",
      "args": [
        {
          "prim": "operation"
        }
      ]
    },
    {
      "prim": "PAIR"
    }
  ]
};

// The lambda JSON to update the FA2 operator of an admin-lambda contract
const update_operators_lambda = (admin_lambda_address, fa2_address, new_operator_address) => {
  return [
    {
      "prim": "PUSH",
      "args": [
        {
          "prim": "address"
        },
        {
          "string": "" + fa2_address + "%update_operators"
        }
      ]
    },
    {
      "prim": "CONTRACT",
      "args": [
        {
          "prim": "list",
          "args": [
            {
              "prim": "or",
              "args": [
                {
                  "prim": "pair",
                  "args": [
                    {
                      "prim": "address"
                    },
                    {
                      "prim": "address"
                    }
                  ]
                },
                {
                  "prim": "pair",
                  "args": [
                    {
                      "prim": "address"
                    },
                    {
                      "prim": "address"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    [
      {
        "prim": "IF_NONE",
        "args": [
          [
            [
              {
                "prim": "UNIT"
              },
              {
                "prim": "FAILWITH"
              }
            ]
          ],
          []
        ]
      }
    ],
    {
      "prim": "PUSH",
      "args": [
        {
          "prim": "mutez"
        },
        {
          "int": "0"
        }
      ]
    },
    {
      "prim": "PUSH",
      "args": [
        {
          "prim": "list",
          "args": [
            {
              "prim": "or",
              "args": [
                {
                  "prim": "pair",
                  "args": [
                    {
                      "prim": "address"
                    },
                    {
                      "prim": "address"
                    }
                  ]
                },
                {
                  "prim": "pair",
                  "args": [
                    {
                      "prim": "address"
                    },
                    {
                      "prim": "address"
                    }
                  ]
                }
              ]
            }
          ]
        },
        [
          {
            "prim": "Left",
            "args": [
              {
                "prim": "Pair",
                "args": [
                  {
                    "string": admin_lambda_address
                  },
                  {
                    "string": new_operator_address
                  }
                ]
              }
            ]
          }
        ]
      ]
    },
    {
      "prim": "TRANSFER_TOKENS"
    },
    {
      "prim": "DIP",
      "args": [
        [
          {
            "prim": "NIL",
            "args": [
              {
                "prim": "operation"
              }
            ]
          }
        ]
      ]
    },
    {
      "prim": "CONS"
    },
    {
      "prim": "PAIR"
    }
  ]
};

const admin_lambda_examples = async () => {
  console.log('inside: admin_lambda_examples');

  const admin_lambda_address = 'KT1GESj71qmXfFHQZgA3kbK3bPaxiyuhXbcE';
  const admin_lambda_contract = await Tezos.contract.at(admin_lambda_address);

  // Check whether bob is actually the admin
  const storage = await admin_lambda_contract.storage();
  console.log('bob is admin:', storage === bob_address);

  // Check whether it's actually the admin-lambda contract
  console.log('is_admin_lambda_contract:', is_admin_lambda_contract(admin_lambda_contract));

  // Update the admin_lambda_contract's admin to bob_address
  const update_admin_op = await admin_lambda_contract.methods.main(update_admin_lambda(bob_address)).send();
  await update_admin_op.confirmation().then(() => console.log('update_admin_op.hash:', update_admin_op.hash));

  // Update the admin_lambda_contract's operator on the
  // fa2_address contract to fred_address:
  const fred_address = 'tz1RwoEdg4efDQHarsw6aKtMUYvg278Gv1ir';
  const fa2_address = 'KT1TUb1czajTExzPiSqaPBzDSYf85VqZ5PzT';
  const update_operator_op = await admin_lambda_contract.methods.main(
    update_operators_lambda(admin_lambda_address, fa2_address, fred_address)
  ).send();
  await update_operator_op.confirmation().then(() => console.log('update_operator_op.hash:', update_operator_op.hash));

  console.log('ending: admin_lambda_examples');
};

admin_lambda_examples();

