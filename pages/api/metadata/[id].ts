// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import initMiddleware from '../../../lib/initMiddleware';

type Data = {
  name: string;
  image: string;
  attributes: {
    trait_type: string;
    slug: string;
    trait_type_slug: string;
    value: string;
  }[];
  description: string;
};

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['GET', 'HEAD'],
  })
);

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  await cors(req, res);
  const { id } = req.query;
  const response = {
    name: `FFPASS #${id}`,
    image:
      'https://cdn.discordapp.com/attachments/263010453376991233/992009389890338907/FFPASS.webp',
    attributes: [
      {
        trait_type: 'DOPE',
        slug: 'dope',
        trait_type_slug: 'DOPE',
        value: 'DOPE',
      },
    ],
    description: 'FFPASS - Official collection of FrogFunding.',
  };
  res.status(200).json(response);
}

export default handler;
