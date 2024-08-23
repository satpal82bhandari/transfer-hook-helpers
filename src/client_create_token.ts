import { Keypair, Transaction, SystemProgram, Connection, PublicKey } from "@solana/web3.js";

import {
  ACCOUNT_SIZE,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import * as bs58 from "bs58";

import { readFileSync } from 'fs';


// connection
//const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
const connection = new Connection("https://api.devnet.solana.com");
// 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8


const keypairData = JSON.parse(readFileSync('/home/satpal/.config/solana/id_user1.json', 'utf8'));
const feePayer = Keypair.fromSecretKey(new Uint8Array(keypairData));

const keypairData2 = JSON.parse(readFileSync('/home/satpal/.config/solana/id_user2.json', 'utf8'));
const feePayer2 = Keypair.fromSecretKey(new Uint8Array(keypairData));


const progId = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');


const mintPubkey = new PublicKey("3G1io3gVyFLFRSjinFKKS3UYE6aQSVkPh2PfEQvoFxEi");

// create token account

// you will need a token account to recieve token in Solana
// in the other words, if you want to receive USDC, you will need a USDC token account
// if you want to receive RAY, you will need a RAY token account
// and these account's address are different (because they are not the same account)

// There are two ways to create token account

// 1. Random
// the main concept is to create a random keypair and init it as a token account
// but I don't recommend you to use this way, it will let user to store many different account
// make managing token account hard.

// 2. Associated Token Address (ATA)
// the recommend one
// this way will derive your token address by your SOL address + mint address
// and anytime you get the same result, if you pass the same SOL address and mint address
// it make managing token account easy, because I can know all of your token address just by your SOL address

(async () => {
  // 1. Random
  
  /*
  
  {
    let tokenAccount = Keypair.generate();
    console.log(`ramdom token address: ${tokenAccount.publicKey.toBase58()}`);

    let tx = new Transaction();
    tx.add(
      // create account
      SystemProgram.createAccount({
        fromPubkey: feePayer2.publicKey,
        newAccountPubkey: tokenAccount.publicKey,
        space: ACCOUNT_SIZE,
        lamports: await getMinimumBalanceForRentExemptAccount(connection),
        programId: progId,
      }),
      // init token account
      createInitializeAccountInstruction(tokenAccount.publicKey, mintPubkey, feePayer2.publicKey, progId)
    );

    console.log(
      `create random token account txhash: ${await connection.sendTransaction(tx, [feePayer, tokenAccount])}`
    );
  }
  
  */
  // 2. ATA
  
  {
    let ata = await getAssociatedTokenAddress(
      mintPubkey, // mint
      feePayer.publicKey, // owner
      false, // allow owner off curve
      progId
    );
    console.log(`ata: ${ata.toBase58()}`);

    let tx = new Transaction();
    tx.add(
      createAssociatedTokenAccountInstruction(
        feePayer.publicKey, // payer
        ata, // ata
        feePayer.publicKey, // owner
        mintPubkey, // mint
        progId
      )
    );

    console.log(`create ata txhash: ${await connection.sendTransaction(tx, [feePayer])}`);
  }
  
})();
