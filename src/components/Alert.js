import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux';
import { myEventsSelector } from '../store/selectors';
import config from '../config.json'

// Since we have set up an event (in Redux) for transaction requests (pending), as well as success and fail cases,
// we can set up this alert to trigger conditionally based on the status of a transaction !!
// (finally convincing me that Redux can be worth using)

export default function Alert() {
    const alertRef = useRef(null)

    const network = useSelector(state => state.provider.network)
    const account = useSelector(state => state.provider.account)
    const isPending = useSelector(state => state.exchange.transaction.isPending)
    const isError = useSelector(state => state.exchange.transaction.isError)
    const events = useSelector(myEventsSelector)

    const removeHandler = async (e) => {
        alertRef.current.className = 'alert alert--remove'
    }

    useEffect(() => {
        if ((events[0] || isPending || isError) && account) { // if transaction is pending (isPending === true) and account exists
            alertRef.current.className = 'alert' // change className of alertRef
        }
    }, [events, isPending, isError, account])

    return (
        <div>
            {isPending ?
                <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                    <h1>Transaction Pending...</h1>
                </div>
                : !isPending && events[0] ? // if transaction is pending and there is an event
                    <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
                        <h1>Transaction Successful</h1>
                        <a
                            // Redux reducers store event info in state, including transaction hash
                            // URL is written using the network from config & transactionHash from state
                            // `https://etherscan.io/tx/${events[0].transactionHash}`}
                            href={config[network] ? `${config[network].explorerURL}/tx/${events[0].transactionHash}` : '#'}
                            target='_blank'
                            rel='noreferrer'
                        >
                            {events[0].transactionHash.slice(0, 6) + '...' + events[0].transactionHash.slice(60, 66)}
                        </a>
                    </div>
                    : isError ?
                        <div className="alert alert--remove">
                            <h1>Transaction Will Fail</h1>
                        </div>
                        :
                        <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div>
            }
        </div>
    );
}
