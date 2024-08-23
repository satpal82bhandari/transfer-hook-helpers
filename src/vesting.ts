import { Connection, Keypair, PublicKey, Transaction, clusterApiUrl, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferInstruction, createTransferCheckedWithTransferHookInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { readFile } from "fs/promises";
import * as anchor from "@coral-xyz/anchor";
import { IDL, VestingTemplate } from "/home/satpal/workspace/transfer-hook-vesting-template/target/types/vesting_template";

//const kpFile = "./accounts/<your key file>.json";
const kpFile = "/home/satpal/.config/solana/id_user1.json";

const main = async () => {

  console.log("💰 Reading wallet...");
  const keyFile = await readFile(kpFile);
  const keypair: anchor.web3.Keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keyFile.toString())));
  //const wallet = new anchor.Wallet(keypair);

  const decimals = 0;


  // Connect to the cluster
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

  // Token mint address (replace with your token's mint address)
  const mintPublicKey = new PublicKey('CyamsGwsQdrjnKqE8VjqqzD6PJeRobtfesAMsYBXpTgm');

  // Sender's token account
  const sourceTokenAccount = new PublicKey('CmdWng9Ayjzd1EnXkhYPku1c1AuNux9KWYtYiUjnTwtc');

  // Recipient's token account
  const recipientTokenAccount = new PublicKey('AVUsnmw3pih9hG8zXLHu3VvcCpbkucKZkUShzaEZvW8C');


  

  const programId = new PublicKey("8HcvNsbA4Kpt2jghxSEmg6PuWwHWkp95usgaiaw1av7r");

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const wallet = provider.wallet as anchor.Wallet;
  //const connection = provider.connection;


  const program = new anchor.Program<VestingTemplate>(IDL, programId, provider);

  // ExtraAccountMetaList address
  // Store extra accounts required by the custom transfer hook instruction
  const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("extra-account-metas"), mintPublicKey.toBuffer()],
    program.programId
  );

  const vestingAccount = PublicKey.findProgramAddressSync([Buffer.from("vesting"), mintPublicKey.toBuffer(), sourceTokenAccount.toBuffer()], program.programId)[0];
  const mintAuth = PublicKey.findProgramAddressSync([Buffer.from("vesting_auth"), mintPublicKey.toBuffer()], program.programId)[0];



  const initializeExtraAccountMetaListInstruction = await program.methods
      .initializeExtraAccountMetaList()
      .accounts({
        payer: wallet.publicKey,
        extraAccountMetaList: extraAccountMetaListPDA,
        mint: mintPublicKey,
      })
      .instruction();

    const transaction = new Transaction().add(
      initializeExtraAccountMetaListInstruction,
    );

    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true },
    );
    console.log("Transaction Signature:", txSig);

    interface VestingData {
      amountBasisPoint: number;
      time: anchor.BN;
    }
  
    const vestingData: VestingData[] = [
      {
        amountBasisPoint: 10000,
        time: new anchor.BN(Math.floor(Date.now() + 3600 / 1000)),
      },
    ];

    const tx = await program.methods
    .createVestingAccount(
      vestingData,
      new anchor.BN(1000 * 10 ** decimals),
    )
    .accounts({
      mint: mintPublicKey,
      token: sourceTokenAccount,
      vestingAccount,
    })
    .signers([wallet.payer]).rpc({ skipPreflight: true });

    console.log("Signature:", tx);
  }



main().then(() => {
  console.log("done!");
  process.exit(0);
}).catch((e) => {
  console.log("Error: ", e);
  process.exit(1);
});