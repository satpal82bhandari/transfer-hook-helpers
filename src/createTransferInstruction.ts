import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferInstruction, createTransferCheckedWithTransferHookInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { readFile } from "fs/promises";
import * as anchor from "@coral-xyz/anchor";

//const kpFile = "./accounts/<your key file>.json";
const kpFile = "/home/satpal/.config/solana/id_user1.json";

const main = async () => {

  console.log("💰 Reading wallet...");
  const keyFile = await readFile(kpFile);
  const keypair: anchor.web3.Keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keyFile.toString())));
  //const wallet = new anchor.Wallet(keypair);


  // Connect to the cluster
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

  // Token mint address (replace with your token's mint address)
  const mintPublicKey = new PublicKey('9JTbLMYjXApRn5SBqxyVDUoGyMusUcmY73nKFLauA52j');

  // Sender's token account
  const senderTokenAccount = new PublicKey('8GqpYmLoQpKwnEUcGGEp9V1uj3jNmWzNQRtpUZpXJLpE');

  // Recipient's token account
  const recipientTokenAccount = new PublicKey('DXXQDuroE8hftfAtdM97jZiiAa38odi3gDRe9HMvfnos');

  // Amount to transfer (in tokens' smallest unit, e.g., if decimals=9, 1 token = 10^9 units)
  //const amount = 1 * Math.pow(10, 9); // 1 token with 9 decimals
  const amount = BigInt(501 * Math.pow(10, 9));
  // Create the transfer instruction
  /*
  const transferInstruction = createTransferInstruction(
    senderTokenAccount,
    recipientTokenAccount,
    keypair.publicKey,
    amount,
    [],
    TOKEN_2022_PROGRAM_ID
  );
  */

  // Create the createTransferCheckedWithTransferHookInstruction 
  
  const transferCheckedInstruction = await createTransferCheckedWithTransferHookInstruction(
    connection,
    senderTokenAccount,
    mintPublicKey,
    recipientTokenAccount,
    keypair.publicKey,
    amount,
    9,
    [],
    "processed",
    TOKEN_2022_PROGRAM_ID
  );

  // Create a transaction
  const transaction = new Transaction().add(transferCheckedInstruction);

  // Send and confirm the transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [
    keypair,
  ]);

  console.log('Transaction confirmed with signature:', signature);
}



main().then(() => {
  console.log("done!");
  process.exit(0);
}).catch((e) => {
  console.log("Error: ", e);
  process.exit(1);
});