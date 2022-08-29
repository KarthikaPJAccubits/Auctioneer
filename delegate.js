import auctioneer, { createSellInstruction } from "@metaplex-foundation/mpl-auctioneer";
import pkg,{ ListingConfigVersion, AuctioneerAuthority} from "@metaplex-foundation/mpl-auctioneer";
import {createDelegateAuctioneerInstruction} from "@metaplex-foundation/mpl-auction-house"
const {AuctioneerAuthorityArgs} =pkg;
import {
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  Connection
} from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import pkggg from '@project-serum/anchor';
const {Provider} = pkggg;
import pkkk from "@project-serum/anchor";
const { BN } = pkkk;
import {ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress ,TOKEN_PROGRAM_ID, getMint} from "@solana/spl-token";
import pkgg,{ Metadata }from "@metaplex-foundation/mpl-token-metadata"
import {TOKEN_METADATA_PROGRAM_ID,WRAPPED_SOL_MINT,AUCTION_HOUSE_PROGRAM_ID,AUCTIONEER} from "./constants.js";
import dotenv from "dotenv";
dotenv.config();

async function by(){

  const key =[251,217,237,185,237,11,111,82,245,239,198,253,92,94,60,117,245,133,8,75,157,200,74,153,121,17,6,232,254,69,82,201,160,189,38,228,115,139,115,238,218,72,80,251,51,20,69,85,105,39,228,32,168,19,187,73,137,55,57,216,15,170,44,123]
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
);
  const wallet =  Keypair.fromSecretKey(await Uint8Array.from(key));
   // const mint = new PublicKey(process.env.MINT);
    const aH = new PublicKey('8omJHcWMa8qMVkwVt3AEXmDJJfvYUoDgng5dfW74ET7A');
    const publicKey = wallet.publicKey

    const auctioneerAuthority =  await PublicKey.findProgramAddress([Buffer.from('auctioneer'),
                                                            aH.toBuffer()]
                                                            ,AUCTIONEER);
     
      const pda =  await PublicKey.findProgramAddress(
                                                  [ Buffer.from('auctioneer'),
                                                    aH.toBuffer(),
                                                    auctioneerAuthority[0].toBuffer()
                                                  ],
                                                  AUCTION_HOUSE_PROGRAM_ID
                                                  );
let delegateIns = {
    auctionHouse: aH,
    authority: publicKey,
    auctioneerAuthority: auctioneerAuthority[0],
    ahAuctioneerPda: pda[0]
}
console.log("======================pda",pda[0].toString())
let scope = {
  scopes :[0,1,2,3,4,5,6]
}

const delegateAuctioneer = await createDelegateAuctioneerInstruction(delegateIns,scope)


let tx = new Transaction();
tx.add(delegateAuctioneer);
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
 tx.feePayer = publicKey
  await tx.sign(wallet);
  const tx1= await sendAndConfirmTransaction(
    connection,
    new Transaction().add(tx),
    [wallet]
  );
  console.log(tx1)

}by()