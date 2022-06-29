// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import clientPromise from '../../lib/mongodb';
import Cors from 'cors';
import initMiddleware from '../../lib/initMiddleware';

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'HEAD'],
  })
);

type Data = {
  root: string;
};

async function handler(_req: NextApiRequest, res: NextApiResponse<Data>) {
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
  const root = tree.getHexRoot();
  res.status(200).json({ root });
}

export default handler;
