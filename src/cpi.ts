import { Connection, SystemProgram } from '@solana/web3.js';
import { createTransferInstruction, createTransferCheckedWithTransferHookInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { readFile } from "fs/promises";
import * as anchor from "@coral-xyz/anchor";
import { CallerProgram } from "/home/satpal/workspace/caller_program/target/types/caller_program";
import idl from '/home/satpal/workspace/caller_program/target/idl/caller_program.json';

//const kpFile = "./accounts/<your key file>.json";
const kpFile = "/home/satpal/.config/solana/id_user1.json";
const kpFile2 = "/home/satpal/.config/solana/id_user2.json";

const main = async () => {

    console.log("💰 Reading wallet...");
    const keyFile = await readFile(kpFile);
    const keypair: anchor.web3.Keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keyFile.toString())));
    const wallet = new anchor.Wallet(keypair);

    const keyFile2 = await readFile(kpFile);
    const keypair2: anchor.web3.Keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keyFile2.toString())));
    const wallet2 = new anchor.Wallet(keypair2);


    // Connect to the cluster
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

    console.log("☕️ Setting provider and program...");
    //const connection = new anchor.web3.Connection(process.env.SOLANA_RPC);
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);
    const callerProgram = new anchor.Program<CallerProgram>(idl as CallerProgram, provider);
    console.log("################");
    console.log(callerProgram.programId);
    console.log("################");

    //const callerProgram = anchor.workspace.CallerProgram;
    const calleeProgramPubkey = new anchor.web3.PublicKey("3Wevbo1b2BNfsNS1knKVwPLwYPFYmCM7hdKtjytvLLkU");


    const transactionSignature = await callerProgram.rpc.callAnotherProgram(new anchor.BN(1000), {
        accounts: {
        payer: wallet.publicKey,
        recipient: wallet2.publicKey,
        calleeProgram: calleeProgramPubkey,
        systemProgram: SystemProgram.programId,
        },
        signers: [keypair],
    });
  console.log(`CPI call to process_cpi completed ${transactionSignature}`);
}

main().then(() => {
  console.log("done!");
  process.exit(0);
}).catch((e) => {
  console.log("Error: ", e);
  process.exit(1);
});