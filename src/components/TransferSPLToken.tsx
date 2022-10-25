import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction, TransactionSignature, PublicKey, TransactionInstruction, Connection } from '@solana/web3.js';
import { createTransferCheckedInstruction, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID,transferChecked} from "@solana/spl-token";
import { FC, useCallback } from 'react';
import { notify } from "../utils/notifications";
import * as bs58 from 'bs58';

const {Buffer} = require('buffer');
const web3 = require('@solana/web3.js');
const crypto = require('crypto');

export const TransferToken: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    // mint key for each token - sample token mint key(USDC)
    const mintPubkey = new PublicKey(
        "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
    );
    // static address for the fees
    const feePayer = Keypair.fromSecretKey(
        bs58.decode('588FU4PktJWfGfxtzpAAXywSNt74AvtroVzGfKkVN1LwRuvHwKGr851uH8czM5qm4iqLbs1kKoMKtMJG4ATR7Ld2'),
    )
    // Spheron token account for receiving the tokens
    const tokenAccountYPubkey = new PublicKey(
        "FaZquuxgR4u9CjwkGGrBjj88AkN9NsGWmR61tgDB3SJL"
    );
    const onClick = useCallback(async () => {
        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }
        let signature: TransactionSignature = '';
        try {
            // get the associated token account for the user
            const tokenAccountXPubkey = await getOrCreateAssociatedTokenAccount(connection, feePayer, mintPubkey, publicKey)
            let tx = new Transaction().add(
                createTransferCheckedInstruction(
                  tokenAccountXPubkey.address, // from (should be a token account)
                  mintPubkey, // mint
                  tokenAccountYPubkey, // to (should be a token account)
                  publicKey, // from's owner
                  1e8, // amount to be paid
                  6 // token decimals
                )
              );
            //   add transaction details - params and units
              await tx.add(
                new TransactionInstruction({
                  keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
                  data: Buffer.from("PACKAGE_PRO_FIRST", "utf-8"),
                  programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
                })
              );

            signature = await sendTransaction(tx, connection);

            await connection.confirmTransaction(signature, 'confirmed');
            notify({ type: 'success', message: 'Transaction successful!', txid: signature });
            const RPC = 'https://api.devnet.solana.com/';
            const SOLANA_CONNECTION = new Connection(RPC);
            let signatureDetail = await SOLANA_CONNECTION.getSignaturesForAddress(publicKey);
            console.log('Fetched Memo: ', signatureDetail[0].memo);
            console.log('Fetched Memo: ', signatureDetail[0].signature);
        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [publicKey, notify, connection, sendTransaction]);

    return (
        <div>
            <button
                className="group w-60 m-2 btn animate-pulse disabled:animate-none bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
                onClick={onClick} disabled={!publicKey}
            >
                <div className="hidden group-disabled:block ">
                    Wallet not connected
                </div>
                <span className="block group-disabled:hidden" > 
                    Transfer SPL Token 
                </span>
            </button>
        </div>
    );
};
