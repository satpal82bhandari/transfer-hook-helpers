import { Connection, SystemProgram } from '@solana/web3.js';
import { createTransferInstruction, createTransferCheckedWithTransferHookInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { readFile } from "fs/promises";
import * as anchor from "@coral-xyz/anchor";
import { AnchorMovieReviewProgram } from "/home/satpal/workspace/cpi-context-movie-review/target/types/anchor_movie_review_program";
import idl from '/home/satpal/workspace/cpi-context-movie-review/target/idl/anchor_movie_review_program.json';
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token"

//const kpFile = "./accounts/<your key file>.json";
//const kpFile = "/home/satpal/.config/solana/id_user1.json";
const kpFile = "/home/satpal/.config/solana/id_user2.json";
//const kpFile2 = "/home/satpal/.config/solana/id_user2.json";

const main = async () => {

    console.log("💰 Reading wallet...");
    const keyFile = await readFile(kpFile);
    const keypair: anchor.web3.Keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keyFile.toString())));
    const wallet = new anchor.Wallet(keypair);

    /*
    const keyFile2 = await readFile(kpFile);
    const keypair2: anchor.web3.Keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keyFile2.toString())));
    const wallet2 = new anchor.Wallet(keypair2);
    */

    // Connect to the cluster
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

    console.log("☕️ Setting provider and program...");
    //const connection = new anchor.web3.Connection(process.env.SOLANA_RPC);
    const provider = new anchor.AnchorProvider(connection, wallet, {});
    anchor.setProvider(provider);
    const anchorMovieReviewProgram = new anchor.Program<AnchorMovieReviewProgram>(idl as AnchorMovieReviewProgram, provider);
    console.log("################");
    console.log(anchorMovieReviewProgram.programId);
    console.log("################");

    const movie = {
      title: "Just a test movie",
      description: "Wow what a good movie it was real great",
      rating: 5,
    };
    const [movie_pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
      anchorMovieReviewProgram.programId
    );

    const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint")],
      anchorMovieReviewProgram.programId
    )

    const tx_initializeTokenMint = await anchorMovieReviewProgram.methods.initializeTokenMint().rpc();

    console.log(`tx_initializeTokenMint: ${tx_initializeTokenMint}`);

    
    const tokenAccount = await getAssociatedTokenAddress(
      mint,
      provider.wallet.publicKey
    )
    
    console.log(`tokenAccount: ${tokenAccount}`);

    
    const tx_addMovieReview = await anchorMovieReviewProgram.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({
        //tokenAccount: tokenAccount,
      })
      .rpc()
    

      console.log(`tx_addMovieReview: ${tx_addMovieReview}`);

      let movieAccountState = await anchorMovieReviewProgram.account.movieAccountState.fetch(movie_pda);

      console.log(`movieAccountState: ${JSON.stringify(movieAccountState)}`);


    const newDescription = "Wow this is new"
    const newRating = 4

    const tx = await anchorMovieReviewProgram.methods
      .updateMovieReview(movie.title, newDescription, newRating)
      .rpc()

      movieAccountState = await anchorMovieReviewProgram.account.movieAccountState.fetch(movie_pda);

      console.log(`movieAccountState: ${JSON.stringify(movieAccountState)}`);
      //const userAta = await getAccount(provider.connection, tokenAccount);
      const tx_deleteMovieReview = await anchorMovieReviewProgram.methods.deleteMovieReview(movie.title).rpc()
      console.log(`tx_deleteMovieReview: ${JSON.stringify(tx_deleteMovieReview)}`);
}

main().then(() => {
  console.log("done!");
  process.exit(0);
}).catch((e) => {
  console.log("Error: ", e);
  process.exit(1);
});