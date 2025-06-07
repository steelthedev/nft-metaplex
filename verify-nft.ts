import { createNft, fetchDigitalAsset, findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import {clusterApiUrl, Connection, LAMPORTS_PER_SOL} from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";



const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const user = await getKeypairFromFile("~/.config/solana/id.json");

await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL * 1, 0.5 * LAMPORTS_PER_SOL);
console.log(`Airdropped 1 SOL to ${user.publicKey.toBase58()}`);

const umi = createUmi(connection.rpcEndpoint);

umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(keypairIdentity(umiUser));
console.log("set up umi user")


const collectionAddress = publicKey("4QST8spwLrSaQG1ZmAc5bDb7bdawEwaFBM9TKz51LP3d");

const nftAddress = publicKey("4VaEyUNmvfVxawZBK5r1sVb98DhAaHL1WKRDuDBPGmzM")

const tx = verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, {mint: nftAddress}),
  collectionMint: collectionAddress,
  authority: umi.identity,


})

tx.sendAndConfirm(umi);

console.log(`Collection NFT verified: ${nftAddress}, see on Explorer: ${getExplorerLink("address", nftAddress, "devnet")}`);