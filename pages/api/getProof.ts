// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import clientPromise from '../../lib/mongodb';

type Data = {
  proof: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const client = await clientPromise;
  const collection = client.db('merkle-tree').collection('addresses');
  const addresses = (
    await collection.findOne(
      {},
      {
        projection: { _id: 1, addresses: 1 },
      }
    )
  ).addresses;
  const tree = new MerkleTree(
    addresses.map((x: string) => keccak256(x)),
    keccak256,
    { sortPairs: true }
  );
  const proof = tree?.getHexProof(
    keccak256((req.query.address as string).toLowerCase())
  );
  res.status(200).json({ proof: `[${proof.join(',')}]` });
}

export default handler;
