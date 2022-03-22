import { gql, request } from 'graphql-request'
import { GRAPHQL_URL } from '@config'
import { IBar, IPosition, IPositionStatus, TradeDirection, Timeframe } from '@lib/grademark'

const GET_CANDLES: string = gql`
    query Candles ($symbol: String, $timeframe: String) {
        candles (symbol: $symbol, timeframe: $timeframe) {
            time
            open
            high
            low
            close
            volume
        }
    }
`
const GET_POSITION_STATUS: string = gql`
    query PositionStatus ($symbol: String) {
        positionStatus (symbol: $symbol) {
            symbol
            direction
            conditionalEntryPrice
            value
        }
    }
`

const GET_OPEN_POSITION: string = gql`
    query Position ($symbol: String) {
        openPosition (symbol: $symbol) {
            symbol
            direction
            entryTime
            entryPrice
            growth
            profit
            profitPct
            holdingPeriod
            initialStopPrice
            curStopPrice
            profitTarget
            initialUnitRisk
            initialRiskPct
            curRiskPct
            curRMultiple
        }
    }
`
const ENTER_POSITION: string = gql`
    mutation EnterPosition ($symbol: String, $direction: TradeDirection, $entryPrice: Float) {
        enterPosition (symbol: $symbol, direction: $direction, entryPrice: $entryPrice) {
            symbol
            direction
            conditionalEntryPrice
            value
        }
    }
`
const OPEN_POSITION: string = gql`
    mutation OpenPosition ($symbol: String $position: InputPosition) {
        openPosition (symbol: $symbol, position: $position) {
            symbol
            direction
            entryTime
            entryPrice
            growth
            profit
            profitPct
            holdingPeriod
            initialStopPrice
            curStopPrice
            profitTarget
            initialUnitRisk
            initialRiskPct
            curRiskPct
            curRMultiple
        }
    }
`
const EXIT_POSITION: string = gql`
    mutation ExitPosition ($symbol: String) {
        exitPosition (symbol: $symbol) {
            symbol
            direction
            conditionalEntryPrice
            value
        }
    }   
`
const CLOSE_POSITION: string = gql`
    mutation ClosePosition ($symbol: String){
        closePosition (symbol: $symbol) {
            symbol
            direction
            conditionalEntryPrice
            value
        }
    }
`
const UPDATE_POSITION: string = gql`
    mutation UpdatePosition ($position: InputPosition) {
        updatePosition (position: $position) {
            symbol
            direction
            entryTime
            entryPrice
            growth
            profit
            profitPct
            holdingPeriod
            initialStopPrice
            curStopPrice
            profitTarget
            initialUnitRisk
            initialRiskPct
            curRiskPct
            curRMultiple
        }
    }
`
export const service = {
    /**
     * Query candles
     * @param symbol The Cryptocurrency unique code
     * @param timeframe The period of time
     * @returns returns an array of candles.
     */
    async getCandles (symbol: string, timeframe: Timeframe): Promise<IBar[]> {
        const { candles } = await request(GRAPHQL_URL, GET_CANDLES, { symbol, timeframe })
        return candles
    },
    /**
     * Query position status
     * @param symbol The Cryptocurrency unique code
     * @returns returns a status of open position
     */
    async getPositionStatus (symbol: string): Promise<IPositionStatus> {
        const { positionStatus } = await request(GRAPHQL_URL, GET_POSITION_STATUS, { symbol })
        if (positionStatus.conditionalEntryPrice === null) {
            positionStatus.conditionalEntryPrice = undefined
        }
        return positionStatus
    },
    /**
     * Query open position
     * @param symbol The Cryptocurrency unique code
     * @returns returns a open position
     */
    async getOpenPosition (symbol: string): Promise<IPosition | null> {
        const { openPosition } = await request(GRAPHQL_URL, GET_OPEN_POSITION, { symbol })
        if (!openPosition.symbol) {
            return null
        }
        return openPosition
    },
    /**
     * Change position 'None' to 'Enter'
     * @param symbol The Cryptocurrency unique code
     * @param direction Long | Short
     * @param entryPrice The price when enter
     * @returns returns a open position when status is Enter
     */
    async enterPosition (symbol: string, direction: TradeDirection, entryPrice: number): Promise<IPosition> {
        const { enterPosition } = await request(GRAPHQL_URL, ENTER_POSITION, { symbol, direction, entryPrice })
        return enterPosition
    },
    /**
     * Change position 'Enter' to 'Position'
     * @param symbol The Cryptocurrency unique code
     * @param position The open position
     * @returns returns a open position when status is Position
     */
    async openPosition (symbol: string, position: IPosition): Promise<IPosition> {
        const { openPosition } = await request(GRAPHQL_URL, OPEN_POSITION, { symbol, position })
        return openPosition
    },
    /**
     * Change not position
     * @param position The open position
     * @returns returns a open position when status is Position
     */
    async updatePosition (position: IPosition): Promise<IPosition> {
        const { updatePosition } = await request(GRAPHQL_URL, UPDATE_POSITION, { position })
        return updatePosition
    },
    /**
     * Change positions 'Position' to 'Exit'
     * @param symbol The Cryptocurrency unique code
     * @returns returns a open position when status is Exit
     */
    async exitPosition (symbol: string): Promise<IPosition> {
        const { exitPosition } = await request(GRAPHQL_URL, EXIT_POSITION, { symbol })
        return exitPosition
    },
    /**
     * Change position 'Exit' to 'None'
     * @param symbol The Cryptocurrency unique code
     * @returns returns a open position when status is None
     */
    async closePosition (symbol: string): Promise<IPosition> {
        const { closePosition } = await request(GRAPHQL_URL, CLOSE_POSITION, { symbol })
        return closePosition
    }
}
