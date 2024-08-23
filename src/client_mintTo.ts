import { Keypair, Transaction, Connection, PublicKey } from "@solana/web3.js";
import { createMintToCheckedInstruction } from "@solana/spl-token";
import * as bs58 from "bs58";


import { readFileSync } from 'fs';

// connection
const connection = new Connection("https://api.devnet.solana.com");
// connection
//const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

const keypairData = JSON.parse(readFileSync('/home/satpal/.config/solana/id_user1.json', 'utf8'));
const feePayer = Keypair.fromSecretKey(new Uint8Array(keypairData));

const progId = new PublicKey('AgvJBtMvCYb9uyL7BHA13aQy9NhtRtDCEuHdX8G27UGJ');

const mintPubkey = new PublicKey("3G1io3gVyFLFRSjinFKKS3UYE6aQSVkPh2PfEQvoFxEi");

const tokenAccount1Pubkey = new PublicKey("6FAbvygBRc6ELaBKZNDabYYJK51WgY54f4QhqtQNmuhP");

//const tokenAccount2Pubkey = new PublicKey("42uhbBWQzKXsUNBAbevrjbXhpJFvRoDC8tCFT1RXBQN2");


// mint token

(async () => {
  let tx = new Transaction();
  tx.add(
    createMintToCheckedInstruction(
      mintPubkey,
      tokenAccount1Pubkey,
      feePayer.publicKey, // mint auth
      5, // amount
      9, // decimals
      [],
      progId
    )
  );
  console.log(`txhash: ${await connection.sendTransaction(tx, [feePayer, feePayer])}`);
})();