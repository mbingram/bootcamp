import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadBalances } from '../store/interactions';
import logo from '../assets/dapp.svg'

export default function Balance() {
    const dispatch = useDispatch()

    let [token1TransferAmount, setToken1TransferAmount] = useState(0)
    let [token2TransferAmount, setToken2TransferAmount] = useState(0)

    const symbols = useSelector(state => state.tokens.symbols)
    const exchange = useSelector(state => state.exchange.contract)
    const exchangeBalances = useSelector(state => state.exchange.balances)
    const tokens = useSelector(state => state.tokens.contracts)
    const account = useSelector(state => state.provider.account)
    const tokenBalances = useSelector(state => state.tokens.balances)

    const amountHandler = (e, token) => {
        if (token.address === tokens[0].address) {
            setToken1TransferAmount(e.target.value)
        }
    }

    const depositHandler = (e, token) => {
        e.preventDefault()
        if (token.address === tokens[0].address){
            setToken1TransferAmount(e.target.value)
        }
    }

    useEffect(() => {
        if (exchange && tokens[0] && tokens[1] && account) {
            loadBalances(exchange, tokens, account, dispatch)
        }
    }, [exchange, tokens, account])


    return (
        <div className='component exchange__transfers'>
            <div className='component__header flex-between'>
                <h2>Balance</h2>
                <div className='tabs'>
                    <button className='tab tab--active'>Deposit</button>
                    <button className='tab'>Withdraw</button>
                </div>
            </div>

            {/* Deposit/Withdraw Component 1 (DApp) */}

            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p><small>Token</small><br /><img src={logo} alt="Token Logo" />{symbols && symbols[0]}</p>
                    <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
                    <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
                </div>

                <form onSubmit={(e) => depositHandler(e, tokens[0])}>
                    <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
                    <input type="text" id='token0' placeholder='0.0000' onChange={(e) => amountHandler(e, tokens[0])} />

                    <button className='button' type='submit' >
                        <span>Deposit</span>
                    </button>
                </form>
            </div>

            <hr />

            {/* Deposit/Withdraw Component 2 (mETH) */}

            <div className='exchange__transfers--form'>
                <div className='flex-between'>

                </div>

                <form>
                    <label htmlFor="token1"></label>
                    <input type="text" id='token1' placeholder='0.0000' />

                    <button className='button' type='submit'>
                        <span></span>
                    </button>
                </form>
            </div>

            <hr />
        </div>
    )
}
