import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, TransactionSignature, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { FC, useCallback } from 'react';
import { notify } from "../utils/notifications";

const {Buffer} = require('buffer');

export const TransferSolToken: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
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
            const lamportsToSend = 1e9; //9 decimals
            const tx = new Transaction().add(
                SystemProgram.transfer({
                  fromPubkey: publicKey,
                  toPubkey: tokenAccountYPubkey,
                  lamports: lamportsToSend,
                })
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
                    Transfer SOL Token 
                </span>
            </button>
        </div>
    );
};
