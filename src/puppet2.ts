import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Puppet } from '/home/ubuntu/solana/puppet_program_with_pda_inside_transfer_hook_program/solana-transfer-hook/target/types/puppet'
import { TransferHookWhale } from '/home/ubuntu/solana/puppet_program_with_pda_inside_transfer_hook_program/solana-transfer-hook/target/types/transfer_hook_whale'





  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)


  const puppetProgram = anchor.workspace.Puppet as Program<Puppet>
  const TransferHookWhaleProgram = anchor.workspace
    .TransferHookWhale as Program<TransferHookWhale>


  const puppetKeypair = Keypair.generate();
  console.log("***************************");
  console.log("puppet account : ",puppetKeypair.publicKey.toBase58());
  console.log("***************************");
  console.log("user or wallet : ", provider.wallet.publicKey.toBase58())
  console.log("***************************");


    (async () => {
    const [puppetPDA, TransferHookWhaleBump] =
      PublicKey.findProgramAddressSync([], TransferHookWhaleProgram.programId);

      console.log("****************************")
      console.log("puppetPDA : ", puppetPDA.toBase58())
      console.log("****************************")

      

    let txn1 = await puppetProgram.methods
      .initialize(puppetPDA)
      .accounts({
        puppet: puppetKeypair.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([puppetKeypair])
      .rpc();
    
      console.log("****************************");
      console.log("initialize transaction : ", txn1);
      console.log("****************************");
      //print transaction logs in cli :
      const connection = TransferHookWhaleProgram.provider.connection;
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txn1,
        },
        "confirmed"
      );
      const txDetails = await TransferHookWhaleProgram.provider.connection.getTransaction(txn1, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      console.log(txDetails);
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      

//-----------------------------------------------------------------------------------------------------

    let txn2 = await TransferHookWhaleProgram.methods
      .pullStrings(TransferHookWhaleBump, new anchor.BN(42))
      .accounts({
        puppetProgram: puppetProgram.programId,
        puppet: puppetKeypair.publicKey,
        authority: puppetPDA,
      })
      .rpc();

      console.log("****************************")
      console.log("pullstring transaction : ", txn2)
      console.log("****************************")
      const connection2 = TransferHookWhaleProgram.provider.connection;
      const latestBlockHash2 = await connection2.getLatestBlockhash();
      await connection2.confirmTransaction(
        {
          blockhash: latestBlockHash2.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txn2,
        },
        "confirmed"
      );
      const txDetails2 = await TransferHookWhaleProgram.provider.connection.getTransaction(txn2, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      console.log(txDetails2);
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      

      


    
  })();

