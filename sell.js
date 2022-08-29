import auctioneer, {  createSellInstruction} from "@metaplex-foundation/mpl-auctioneer";
import {
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  Connection
} from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import pkg from "@project-serum/anchor";
const { BN } = pkg;
import { getAssociatedTokenAddress} from "@solana/spl-token";
import {TOKEN_METADATA_PROGRAM_ID,WRAPPED_SOL_MINT,AUCTION_HOUSE_PROGRAM_ID,AUCTIONEER} from "./constants.js";
import dotenv from "dotenv";
dotenv.config();

async function sell()
{
  const key =[251,217,237,185,237,11,111,82,245,239,198,253,92,94,60,117,245,133,8,75,157,200,74,153,121,17,6,232,254,69,82,201,160,189,38,228,115,139,115,238,218,72,80,251,51,20,69,85,105,39,228,32,168,19,187,73,137,55,57,216,15,170,44,123]
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
);

    
    const wallet =  Keypair.fromSecretKey(await Uint8Array.from(key));
    const mint = new PublicKey("2ziSXtPzkgVAPmU9wjsNGFzd4Xj7qVXQXqtbeKDgJPFE");
    const aH = new PublicKey("8omJHcWMa8qMVkwVt3AEXmDJJfvYUoDgng5dfW74ET7A");
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
                                                  console.log("------------pda",pda.toString())

    const associatedAddress = await getAssociatedTokenAddress(
        mint,
        publicKey
    );

    const listingConfig = await PublicKey.findProgramAddress(
    [ Buffer.from("listing_config"),
      publicKey.toBuffer(),
      aH.toBuffer(),
      associatedAddress.toBuffer(),
      WRAPPED_SOL_MINT.toBuffer(),
      mint.toBuffer(),
      new BN(1).toBuffer('le',8)
    ],
      AUCTIONEER
    )
    console.log("listingConfig============",listingConfig.toString())
  
  async function getAuctionHouseTradeState( 
    auctionHouse, 
    wallet, 
    tokenAccount, 
    treasuryMint, 
    tokenMint, 
    tokenSize, 
    buyPrice 
  ) { 
    return await PublicKey.findProgramAddress( 
      [ 
        Buffer.from('auction_house'), 
        wallet.toBuffer(), 
        auctionHouse.toBuffer(), 
        tokenAccount.toBuffer(), 
        treasuryMint.toBuffer(), 
        tokenMint.toBuffer(), 
        new BN(buyPrice).toArrayLike(Buffer, "le", 8), 
        new BN(tokenSize).toArrayLike(Buffer, "le", 8), 
      ], 
      AUCTION_HOUSE_PROGRAM_ID 
    ); 
  }

  
    const [sellerTradeState, tradeBump] = await getAuctionHouseTradeState( 
        aH, 
        wallet.publicKey, 
        associatedAddress, 
        WRAPPED_SOL_MINT, 
        mint, 
        1, 
        "18446744073709551615" 
    );
    

    const [freeTradeState, freeTradeBump] = await getAuctionHouseTradeState( 
        aH, 
        wallet.publicKey, 
        associatedAddress, 
        WRAPPED_SOL_MINT, 
        mint, 
        1, 
        "0" 
    );


    const feePayer = await PublicKey.findProgramAddress(
        [
        Buffer.from('auction_house'),
        aH.toBuffer(),
        Buffer.from('fee_payer'),
        ],
        AUCTION_HOUSE_PROGRAM_ID
    );

    const metadata = await anchor.web3.PublicKey.findProgramAddress(
        [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    )

    const [signer,signerBump] = await PublicKey.findProgramAddress([Buffer.from('auction_house'),
                                                                    Buffer.from('signer')
                                                                    ],
                                                                        AUCTION_HOUSE_PROGRAM_ID
                                                                    );

    const accounts =  {
        auctionHouseProgram: AUCTION_HOUSE_PROGRAM_ID,
        listingConfig: listingConfig[0],
        wallet: publicKey,
        tokenAccount: associatedAddress,
        metadata: metadata[0],
        authority: new PublicKey("BpTX5ScjquP5CWP4reNDseRmeehih9dqDn593gdDvpMG"),
        auctionHouse: aH,
        auctionHouseFeeAccount: feePayer[0],
        sellerTradeState: sellerTradeState,
        freeSellerTradeState: freeTradeState,
        auctioneerAuthority: auctioneerAuthority[0],
        ahAuctioneerPda: new PublicKey("8toVWzSsAiy9osYxsubwoXEP2L8idSwACAwvoFZyGuk2"),
        programAsSigner: signer,
    }


    const auctioneerAuthorityBump = await auctioneer.AuctioneerAuthority.fromAccountAddress(connection,auctioneerAuthority[0])

    const args = {
      tradeStateBump: tradeBump,
      freeTradeStateBump: freeTradeBump,
      programAsSignerBump: signerBump,
      auctioneerAuthorityBump: auctioneerAuthorityBump,
      tokenSize: new BN(Math.ceil(1 * 1)),
      startTime: 1660116100,
      endTime: 1660116213,
      reservePrice: 1,
      minBidIncrement: 1,
      timeExtPeriod: 1,
      timeExtDelta: 1,
      allowHighBidCancel: true
    }
    
    const sellInstruction  =  await createSellInstruction(accounts,args)


    let tx = new Transaction();
    tx.add(sellInstruction);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    tx.feePayer = wallet.publicKey
    
    const tx1= await sendAndConfirmTransaction(
      connection,
      new Transaction().add(tx),
      [wallet]
    );
    console.log(tx1)
    
}

sell();