import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";

import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  CompressedTokenProgram,
  selectMinCompressedTokenAccountsForTransfer,
} from "@lightprotocol/compressed-token";
import { bn, createRpc, Rpc } from "@lightprotocol/stateless.js";

const blockchain = BLOCKCHAIN_IDS.mainnet;

const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

// OPTIONS endpoint is required for CORS preflight requests
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

export const GET = async (req: Request) => {
  const response: ActionGetResponse = {
    type: "action",
    icon: `${new URL("/img.png", req.url).toString()}`,
    label: "Compressed Token",
    title: "Transfer Compressed Token",
    description: "Transfer a compreseed token using this blink.",
    links: {
      actions: [
        {
          label: "Transfer the token",
          href: "/api/actions/transfer",
          type: "transaction",
          parameters: [
            {
              name: "mint",
              label: "Token Mint Address",
              type: "text",
              required: true,
            },
            {
              name: "amount",
              label: "token amount (raw)",
              type: "number",
              required: true,
            },
            {
              name: "recipient",
              label: "minted token recipient",
              type: "url",
              required: true,
            },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

export const POST = async (req: Request) => {
  try {
    const body: ActionPostRequest = await req.json();

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      console.log(err);
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    const data: any = body.data;

    const fromPubkey = new PublicKey(account);
    const toPubkey = new PublicKey(data.recipient);
    const mint_address = new PublicKey(data.mint);

    const RPC_ENDPOINT =
      "https://mainnet.helius-rpc.com/?api-key=c991f045-ba1f-4d71-b872-0ef87e7f039d";

    const connection: Rpc = createRpc(RPC_ENDPOINT, RPC_ENDPOINT, RPC_ENDPOINT);

    const compressedTokenAccounts =
      await connection.getCompressedTokenAccountsByOwner(fromPubkey, {
        mint: mint_address,
      });

    const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
      compressedTokenAccounts.items,
      data.amount,
    );

    const proof = await connection.getValidityProof(
      inputAccounts.map((account) => bn(account.compressedAccount.hash)),
    );

    const instruction = await CompressedTokenProgram.transfer({
      payer: fromPubkey,
      inputCompressedTokenAccounts: inputAccounts,
      toAddress: toPubkey,
      amount: data.amount,
      recentInputStateRootIndices: proof.rootIndices,
      recentValidityProof: proof.compressedProof,
    });

    const { blockhash } = await connection.getLatestBlockhash();

    const transaction = new TransactionMessage({
      recentBlockhash: blockhash,
      payerKey: fromPubkey,
      instructions: [],
    });

    transaction.instructions.push(instruction);

    const versionedTransaction = new VersionedTransaction(
      transaction.compileToV0Message(),
    );

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(versionedTransaction.serialize()).toString(
        "base64",
      ),
    };

    return Response.json(response, { status: 200, headers });
  } catch (err) {
    console.error(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
};
