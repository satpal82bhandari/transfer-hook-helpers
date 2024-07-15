import {
    closeAccount,
    createInitializeMintInstruction,
    createInitializeMintCloseAuthorityInstruction,
    getMintLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import {
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';

(async () => {
    const payer = Keypair.generate();
    console.log(`wallet: ${payer.publicKey}\n\n`)

    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log(`mint: ${mint}\n\n`)

    const mintAuthority = Keypair.generate();
    const freezeAuthority = Keypair.generate();
    const closeAuthority = Keypair.generate();
    console.log(`close authority: ${closeAuthority.publicKey}\n\n`)

    const connection = new Connection("http://localhost:8899", 'confirmed');

    const airdropSignature = await connection.requestAirdrop(payer.publicKey, 200 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

    const extensions = [ExtensionType.MintCloseAuthority];
    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMintCloseAuthorityInstruction(mint, closeAuthority.publicKey, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(
            mint,
            9,
            mintAuthority.publicKey,
            freezeAuthority.publicKey,
            TOKEN_2022_PROGRAM_ID
        )
    );

    
    const create_txnid = await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair], undefined);
    console.log(create_txnid);

    const close_txnid = await closeAccount(connection, payer, mint, payer.publicKey, closeAuthority, [], undefined, TOKEN_2022_PROGRAM_ID);
    console.log(close_txnid);
    
})();
