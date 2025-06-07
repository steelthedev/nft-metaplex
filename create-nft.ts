import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

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

console.log("creating nft...")

const mint = generateSigner(umi);

const transaction = createNft(umi, {
  mint,
  name: "My NFT",
  uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-offchain-data.json",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAddress,
    verified: false,
  },
});

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(
  `🖼️ Created NFT! Address is ${getExplorerLink(
    "address",
    createdNft.mint.publicKey,
    "devnet"
  )}`
);