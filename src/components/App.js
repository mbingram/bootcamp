import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken
} from '../store/interactions';

export default function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    // fetch account/add to state
    await loadAccount(dispatch)
    // connect ethers to blockchain w/ provider/add provider to state
    const provider = loadProvider(dispatch)
    // fetch chainId/add to state
    const chainId = await loadNetwork(provider, dispatch)
    // fetch Token smart contract/add to state
    const token = await loadToken(provider, config[chainId].mBC.address, dispatch)
    await token.symbol()
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}