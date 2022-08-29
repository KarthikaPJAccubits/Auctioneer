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
import fs from "fs"


    const key = [251,217,237,185,237,11,111,82,245,239,198,253,92,94,60,117,245,133,8,75,157,200,74,153,121,17,6,232,254,69,82,201,160,189,38,228,115,139,115,238,218,72,80,251,51,20,69,85,105,39,228,32,168,19,187,73,137,55,57,216,15,170,44,123]
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
  );
    const wallet =  Keypair.fromSecretKey( Uint8Array.from(key));
    //const mint = new PublicKey(process.env.MINT);
    const aH = new PublicKey("8omJHcWMa8qMVkwVt3AEXmDJJfvYUoDgng5dfW74ET7A");
    const publicKey = wallet.publicKey;
    console.log(publicKey)

 const auctioneerAuthority =  await PublicKey.findProgramAddress([Buffer.from('auctioneer'),
                                                            aH.toBuffer()]
                                                            ,AUCTIONEER);

const authorizeKeys = {
    wallet: publicKey,
    auctionHouse: aH,
    auctioneerAuthority: auctioneerAuthority[0],
  }

const authorizeIns = await auctioneer.createAuthorizeInstruction(authorizeKeys);

let ix = new Transaction();
ix.add(authorizeIns);
ix.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
ix.feePayer = publicKey
ix.instructions[0].keys[3]
ix.instructions[0].programId = AUCTIONEER
  
await ix.sign(wallet);
const tx= await sendAndConfirmTransaction(
  connection,
  new Transaction().add(ix),
  [wallet]
);
console.log(tx)

  // const sign = await connection.sendRawTransaction(ix.serialize());

  // const tra = await connection.confirmTransaction(sign, 'confirmed');
  // console.log(tra);