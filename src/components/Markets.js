import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import config from '../config.json';
import { loadTokens } from '../store/interactions';

export default function Markets() {
    const dispatch = useDispatch()

    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const account = useSelector(state => state.provider.account)
    const balance = useSelector(state => state.provider.balance)

    const marketHandler = async (e) => {
        const addresses = (e.target.value).split(',')
        console.log(addresses)
        await loadTokens(provider, (e.target.value).split(','), dispatch)
    }

    return (
        <div className='component exchange__markets'>
            <div className='component__header'>
                <h2>Select Market</h2>
            </div>
            {chainId && config[chainId] ?
                <select name="markets" id="markets" onChange={(e) => marketHandler(e)} >
                    <option value={`${config[chainId].mBC.address},${config[chainId].mETH.address}`}>mBC / mETH</option>
                    <option value={`${config[chainId].mBC.address},${config[chainId].mDAI.address}`}>mBC / mDAI</option>
                </select>
                :
                <div>
                    <p>Not deployed to network.</p>
                </div>
            }
            <hr />
        </div>
    )

}
