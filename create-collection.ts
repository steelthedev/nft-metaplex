import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import {clusterApiUrl, Connection, LAMPORTS_PER_SOL} from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";



const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const user = await getKeypairFromFile("~/.config/solana/id.json");

await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL * 1, 0.5 * LAMPORTS_PER_SOL);
console.log(`Airdropped 1 SOL to ${user.publicKey.toBase58()}`);

const umi = createUmi(connection.rpcEndpoint);

umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(keypairIdentity(umiUser));
console.log("set up umi user")

const collectionMint = generateSigner(umi)


const tx = createNft(umi, {
    mint: collectionMint,
    name: "My Collection",
    symbol: "COLL",
    uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-offchain-data.json",
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true // 2% royalty
})

await tx.sendAndConfirm(umi);


const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);
console.log(`Collection NFT created: ${createdCollectionNft.metadata.name} (${createdCollectionNft.mint})`);
console.log(`View on Explorer: ${getExplorerLink("address", createdCollectionNft.mint.publicKey, "devnet")}`);