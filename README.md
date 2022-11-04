# A simple website that helps you generate Merkle trees for your NFT project

You can use the "Add address" button to add a new address to the tree.

Underneath the tree, you can see the Merkle root and a list of all the addresses

You can also the "Generate your proof" section to generate a proof for a specific address

Try it on [https://nft-merkle-tree-utils.vercel.app](https://nft-merkle-tree-utils.vercel.app)

## API Routes || WIP

### How to use

1. Create a MongoDB database
2. Add a collection called **addresses** to your database, and populate it with a list of addresses
3. Clone the repo
4. Run `pnpm i` (or `npm i` or `yarn`)
5. Create a .env file in the root directory and add a MONGODB_URI property with your MongoDB connection string
6. Run `pnpm dev` (or `npm run dev` or `yarn dev`)
7. Now you can call `/api/getProof?address={YOUR_ADDRESS}` to get the proof for a specific address and `/api/getRoot` to get the Merkle root
