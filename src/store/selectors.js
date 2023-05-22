import { createSelector } from 'reselect'
import { get, groupBy, reject, maxBy, minBy } from 'lodash'
import { ethers } from 'ethers'
import moment from 'moment'

const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts')
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

// filter out filled orders and cancelled orders, to only return open orders
const openOrders = state => {
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)
    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
        const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
        return orderFilled || orderCancelled
    })

    return openOrders
}

const decorateOrder = (order, tokens) => {
    // write new values to each order
    let token0Amount, token1Amount

    if (order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGive
        token1Amount = order.amountGet
    } else {
        token0Amount = order.amountGet
        token1Amount = order.amountGive
    }

    // calculate token price to 5 decimal places
    const precision = 100000
    let tokenPrice = (token1Amount / token0Amount)
    tokenPrice = Math.round(tokenPrice * precision) / precision

    return ({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
        token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

// ALL FILLED ORDERS
export const filledOrderSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }
        // filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // 1. sort orders by time ascending
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)
        // 2. decorate orders (apply colors)
        orders = decorateFilledOrders(orders, tokens)
        // 3. sort orders by time descending for UI
        orders = orders.sort((a, b) => b.timestamp - a.timestamp)

        return orders
    }
)

const decorateFilledOrders = (orders, tokens) => {
    // track previous order to compare history
    let previousOrder = orders[0]

    return(
        orders.map((order) => {
            // decorate each individual order
            order = decorateOrder(order, tokens)
            order = decorateFilledOrder(order, previousOrder)
            previousOrder = order // update the previous order once it's decorated
            return order
        })
    )
}

const decorateFilledOrder = (order, previousOrder) => {
    return({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    // check if there is an existing previousOrder
    if(previousOrder.id === orderId){
        return GREEN // assign GREEN class if only one order exists
    }

    if(previousOrder.tokenPrice <= tokenPrice){
        return GREEN // assign GREEN class if order price is higher than previous order
    } else {
        return RED // assign RED class if order price is lower than previous order
    }
}

// ORDER BOOK
export const orderBookSelector = createSelector( // 3 arguments are the state items we want to fetch
    openOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }
        // filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
        // decorate orders
        orders = decorateOrderBookOrders(orders, tokens)
        // group orders by order type (creates 2 seperate arrays with 'buy' and 'sell' keys)
        orders = groupBy(orders, 'orderType')
        // fetch buyOrders
        const buyOrders = get(orders, 'buy', [])
        // sort buyOrders by token price
        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
        }
        // fetch sellOrders
        const sellOrders = get(orders, 'sell', [])
        // sort sell orders by token price
        orders = {
            ...orders,
            sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
        }

        return orders
    })

const decorateOrderBookOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return order
        })
    )
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return ({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    })
}

// PRICE CHART
export const priceChartSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) {return null}
        // filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
        // sort orders by timestamp
        orders = orders.sort((a, b) => a.timestamp - b.timestamp)
        // decorate orders - add display attributes
        orders = orders.map((o) => decorateOrder(o, tokens))

        // get last 2 orders for final price & price change
        let secondLastOrder, lastOrder
        [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
        // get last order price -- if it's null, pass in 0
        const lastPrice = get(lastOrder, 'tokenPrice', 0)
        // get second to last order price
        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

        return({
            lastPrice,
            lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
            series: [{
                data: buildGraphData(orders)
            }]
        })
    })

const buildGraphData = (orders) => {
    // group orders by hour for graph
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())
    // get each hour where data exists
    const hours = Object.keys(orders)
    // build the graph series
    const graphData = hours.map((hour) => {
        // fetch all orders from current hour
        const group = orders[hour]
        // calculate prices: open, high, low, close
        const open = group[0] // first order
        const high = maxBy(group, 'tokenPrice') // high price
        const low = minBy(group, 'tokenPrice') // low price
        const close = group[group.length - 1] // last order

        return ({
            x: new Date(hour),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        })
    })

    return graphData
}
