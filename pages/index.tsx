import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { BeakerIcon } from '@heroicons/react/solid';

const Home: NextPage = () => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [tree, setTree] = useState<MerkleTree | null>(null);

  const buf2hex = (x: Buffer) => '0x' + x.toString('hex');

  // Restore the state of the addresses from the cookie
  // This will be used to restore the state of the addresses
  // when the user reloads the page
  useEffect(() => {
    const cookie = document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('addresses='));
    console.log(cookie);

    if (cookie) {
      const addresses = JSON.parse(cookie.split('=')[1]);
      console.log(addresses);
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

  return (
    <div className='bg-slate-600 w-screen h-screen'>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='max-w-lg m-auto text-gray-200'>
        <ul role='list' className='divide-y divide-slate-700'>
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
                className='shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 text-black rounded-md'
                placeholder='0x...'
                value={address}
                onChange={(e) =>
                  setAddresses(
                    addresses.map((value, i) => {
                      const newValue = i !== index ? value : e.target.value;
                      return newValue;
                    })
                  )
                }
              />
              <button
                type='button'
                className='inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                onClick={() =>
                  setAddresses(addresses.filter((_, i) => i !== index))
                }
              >
                <BeakerIcon className='h-5 w-5' aria-hidden='true' />
              </button>
            </li>
          ))}
        </ul>

        <button
          type='button'
          className='inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          onClick={() => setAddresses(addresses.concat(''))}
        >
          Add new address
        </button>
        {tree && (
          <div className='mt-6'>
            <h1 className='font-bold text-xl'>Merkle Tree Root:</h1>
            <p>
              <code>{buf2hex(tree.getRoot())}</code>
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;