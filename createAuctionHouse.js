
import {
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  Connection
} from "@solana/web3.js";

import {
  createBuyInstruction,
  createCreateAuctionHouseInstruction,
  createDepositInstruction,
  createExecuteSaleInstruction,
  createSellInstruction,
  createWithdrawFromTreasuryInstruction,
} from "@metaplex-foundation/mpl-auction-house";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  findAssociatedTokenAccountPda,
  findAuctionHouseBuyerEscrowPda,
  findAuctionHouseFeePda,
  findAuctionHousePda,
  findAuctionHouseProgramAsSignerPda,
  findAuctionHouseTradeStatePda,
  findAuctionHouseTreasuryPda,
  
} from "@metaplex-foundation/js";

async function createAuctionHouse(){
    const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
    );
const key =[251,217,237,185,237,11,111,82,245,239,198,253,92,94,60,117,245,133,8,75,157,200,74,153,121,17,6,232,254,69,82,201,160,189,38,228,115,139,115,238,218,72,80,251,51,20,69,85,105,39,228,32,168,19,187,73,137,55,57,216,15,170,44,123]
const wallet =  Keypair.fromSecretKey(await Uint8Array.from(key));
const auctionHouse = findAuctionHousePda(wallet.publicKey, NATIVE_MINT);
const auctionHouseFeeAccount = findAuctionHouseFeePda(auctionHouse);
const auctionHouseTreasury = findAuctionHouseTreasuryPda(auctionHouse);
const ix = createCreateAuctionHouseInstruction(
  {
    treasuryMint: NATIVE_MINT,
    payer: wallet.publicKey,
    authority: wallet.publicKey,
    feeWithdrawalDestination: wallet.publicKey,
    treasuryWithdrawalDestination: wallet.publicKey,
    treasuryWithdrawalDestinationOwner: wallet.publicKey,
    auctionHouse,
    auctionHouseFeeAccount,
    auctionHouseTreasury,
  },
  {
    bump: auctionHouse.bump,
    feePayerBump: auctionHouseFeeAccount.bump,
    treasuryBump: auctionHouseTreasury.bump,
    sellerFeeBasisPoints:1000,
    requiresSignOff:false,
    canChangeSalePrice:false,
  }
);
const fillTreasuryWithRentIx = SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: auctionHouseTreasury,
    lamports: await connection.getMinimumBalanceForRentExemption(
      0
    ),
   
      
  });
 const tx= await sendAndConfirmTransaction(
    connection,
    new Transaction().add(ix, fillTreasuryWithRentIx),
    [wallet]
  );
console.log(tx)
}
createAuctionHouse()