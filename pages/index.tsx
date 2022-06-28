import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/solid';
import { toast } from 'react-toastify';

// Function that receives a text and copies to clipboard
function copyToClipboard(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

const Home: NextPage = () => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [tree, setTree] = useState<MerkleTree | null>(null);
  const [proof, setProof] = useState<string[]>([]);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Restore the state of the addresses from the cookie
  // This will be used to restore the state of the addresses
  // when the user reloads the page
  useEffect(() => {
    const cookie = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('addresses='));

    if (cookie) {
      const addresses = JSON.parse(cookie.split('=')[1]);
      setAddresses(addresses);
    }
    setInitialLoadDone(true);
  }, []);

  // Whenever addresses changes, save it as a cookie value
  // But do not override the initial loading of the page
  useEffect(() => {
    if (addresses.length > 0 || initialLoadDone) {
      document.cookie = `addresses=${JSON.stringify(
        addresses.filter((a) => !!a)
      )}`;

      setTree(
        new MerkleTree(
          addresses.map((x) => keccak256(x)),
          keccak256,
          { sortPairs: true }
        )
      );
    }
  }, [addresses, initialLoadDone]);

  // Generate the proof whenever the user address changes
  useEffect(() => {
    if (!userAddress) return;

    const proof = tree?.getHexProof(keccak256(userAddress.toLowerCase()));
    setProof(proof || []);
  }, [userAddress, tree]);

  const formatProof = (proof: string[]) => `[${proof.join(',')}]`;

  return (
    <>
      <Head>
        <title>Merkle Tree Utils</title>
        <meta
          name='description'
          content='Utilities for your NFT Merkle Tree needs'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <h1 className='w-full text-center text-4xl font-bold pt-5 pb-11 text-violet-300'>
        Get the data for your NFT Merkle Tree
      </h1>
      <main className='max-w-2xl m-auto flex gap-y-5 flex-col'>
        <div>
          <h2 className='text-lg font-bold'>
            Insert the addresses that need to be in your Merkle Tree
          </h2>
          <ul role='list' className='divide-y divide-stone-700'>
            {/* Create a list of inputs, one for each address. The user can then add or remove existing entries */}
            {addresses.map((address, index) => (
              <li key={index} className='py-4 flex gap-x-2'>
                <label htmlFor={`address${index}`} className='sr-only'>
                  Email
                </label>
                <input
                  type='text'
                  name={`address${index}`}
                  id={`address${index}`}
                  className='shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-stone-300 text-stone-900 rounded-md'
                  placeholder='0x...'
                  value={address}
                  onChange={(e) =>
                    setAddresses(
                      addresses.map((value, i) => {
                        const newValue = i !== index ? value : e.target.value;
                        return newValue.toLowerCase();
                      })
                    )
                  }
                />
                <button
                  type='button'
                  className='inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-white bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                  onClick={() =>
                    setAddresses(addresses.filter((_, i) => i !== index))
                  }
                >
                  <TrashIcon className='h-5 w-5' aria-hidden='true' />
                </button>
              </li>
            ))}
          </ul>

          <button
            type='button'
            className='inline-flex items-center px-2.5 py-1.5 border border-transparent text-md font-medium rounded text-violet-700 bg-violet-100 hover:bg-violet-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500'
            onClick={() => setAddresses(addresses.concat(''))}
          >
            Add new address
          </button>
        </div>

        <div className='relative'>
          <div
            className='absolute inset-0 flex items-center'
            aria-hidden='true'
          >
            <div className='w-full border-t border-stone-700' />
          </div>
          <div className='relative flex justify-center'>
            <span className='px-2 bg-stone-800 text-md font-semibold'>
              Your Data:
            </span>
          </div>
        </div>

        <div>
          {tree && (
            <div className='flex flex-col gap-y-6'>
              <div>
                <h1 className='font-bold text-xl'>Merkle Tree Root:</h1>
                <div
                  className='break-all mt-5 p-6 bg-amber-100 text-slate-800 font-semibold rounded-md cursor-pointer'
                  onClick={() => {
                    copyToClipboard(tree.getHexRoot());
                    toast('Root copied to clipboard');
                  }}
                >
                  <p>{tree.getHexRoot()}</p>
                </div>
              </div>

              <div>
                <h1 className='font-bold text-xl'>List of addresses:</h1>
                <div
                  className='break-all mt-5 p-6 bg-amber-100 text-slate-800 font-semibold rounded-md cursor-pointer'
                  onClick={() => {
                    copyToClipboard(formatProof(addresses));
                    toast('Addresses copied to clipboard');
                  }}
                >
                  <p>{formatProof(addresses)}</p>
                </div>
              </div>

              {/* Let the user input their address and generate a proof based on it */}
              <div>
                <h1 className='font-bold text-xl'>Generate your proof</h1>
                <div className='mt-3'>
                  <label
                    htmlFor='user-address'
                    className='block text-sm font-medium'
                  >
                    User Address
                  </label>
                  <input
                    type='text'
                    name='user-address'
                    id='user-address'
                    className='shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-stone-300 text-stone-700 rounded-md mt-1'
                    placeholder='0x...'
                    value={userAddress || ''}
                    onChange={(e) =>
                      setUserAddress(e.target.value.toLowerCase())
                    }
                  />
                  {/* On clieck copy the proof to the clipboard */}
                  <div
                    className='break-all mt-5 p-6 bg-amber-100 text-slate-800 font-semibold rounded-md cursor-pointer'
                    onClick={() => {
                      copyToClipboard(formatProof(proof));
                      toast('Proof copied to clipboard');
                    }}
                  >
                    <p>{formatProof(proof)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
