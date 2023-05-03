import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';
import {
  loadProvider,
  loadNetwork,
  loadTokens,
  loadAccount,
  loadExchange
} from '../store/interactions';
import Navbar from './Navbar';
import Markets from './Markets';

export default function App() {
  const dispatch = useDispatch()

  // let [provider, setProvider] = useState()
  // let [chainId, setChainId] = useState()
  // let [token, setToken] = useState()
  // let [account, setAccount] = useState()
  // let [exchange, setExchange] = useState()

  const loadBlockchainData = async () => {
    const provider = loadProvider(dispatch)    // connect ethers to blockchain w/ provider/add provider to state
    const chainId = await loadNetwork(provider, dispatch)    // fetch chainId for current network/add to state

    // reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    const mBC = config[chainId].mBC     // fetch Token smart contracts/add to state
    const mETH = config[chainId].mETH
    await loadTokens(provider, [mBC.address, mETH.address], dispatch)

    const exchangeConfig = config[chainId].exchange    // load exchange contract
    await loadExchange(provider, exchangeConfig.address, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

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