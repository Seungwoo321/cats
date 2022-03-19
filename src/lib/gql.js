"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.service = void 0;
const graphql_request_1 = require("graphql-request");
const config_1 = require("../config");
const GET_CANDLES = (0, graphql_request_1.gql) `
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
`;
const GET_POSITION_STATUS = (0, graphql_request_1.gql) `
    query PositionStatus ($symbol: String) {
        positionStatus (symbol: $symbol) {
            symbol
            direction
            conditionalEntryPrice
            value
        }
    }
`;
const GET_OPEN_POSITION = (0, graphql_request_1.gql) `
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
`;
const ENTER_POSITION = (0, graphql_request_1.gql) `
    mutation EnterPosition ($symbol: String, $direction: TradeDirection, $entryPrice: Float) {
        enterPosition (symbol: $symbol, direction: $direction, entryPrice: $entryPrice) {
            symbol
            direction
            conditionalEntryPrice
            value
        }
    }
`;
const OPEN_POSITION = (0, graphql_request_1.gql) `
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
`;
const EXIT_POSITION = (0, graphql_request_1.gql) `
    mutation ExitPosition ($symbol: String) {
        exitPosition (symbol: $symbol) {
            symbol
            direction
            conditionalEntryPrice
            value
        }
    }   
`;
const CLOSE_POSITION = (0, graphql_request_1.gql) `
    mutation ClosePosition ($symbol: String){
        closePosition (symbol: $symbol) {
            symbol
            direction
            conditionalEntryPrice
            value
        }
    }
`;
const UPDATE_POSITION = (0, graphql_request_1.gql) `
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
`;
exports.service = {
    /**
     * Query candles
     * @param symbol The Cryptocurrency unique code
     * @param timeframe The period of time
     * @returns returns an array of candles.
     */
    getCandles(symbol, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            const { candles } = yield (0, graphql_request_1.request)(config_1.GRAPHQL_URL, GET_CANDLES, { symbol, timeframe });
            return candles;
        });
    },
    /**
     * Query position status
     * @param symbol The Cryptocurrency unique code
     * @returns returns a status of open position
     */
    getPositionStatus(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const { positionStatus } = yield (0, graphql_request_1.request)(config_1.GRAPHQL_URL, GET_POSITION_STATUS, { symbol });
            if (positionStatus.conditionalEntryPrice === null) {
                positionStatus.conditionalEntryPrice = undefined;
            }
            return positionStatus;
        });
    },
    /**
     * Query open position
     * @param symbol The Cryptocurrency unique code
     * @returns returns a open position
     */
    getOpenPosition(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const { openPosition } = yield (0, graphql_request_1.request)(config_1.GRAPHQL_URL, GET_OPEN_POSITION, { symbol });
            if (!openPosition.symbol) {
                return null;
            }
            return openPosition;
        });
    },
    /**
     * Change position 'None' to 'Enter'
     * @param symbol The Cryptocurrency unique code
     * @param direction Long | Short
     * @param entryPrice The price when enter
     * @returns returns a open position when status is Enter
     */
    enterPosition(symbol, direction, entryPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            const { enterPosition } = yield (0, graphql_request_1.request)(config_1.GRAPHQL_URL, ENTER_POSITION, { symbol, direction, entryPrice });
            return enterPosition;
        });
    },
    /**
     * Change position 'Enter' to 'Position'
     * @param symbol The Cryptocurrency unique code
     * @param position The open position
     * @returns returns a open position when status is Position
     */
    openPosition(symbol, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const { openPosition } = yield (0, graphql_request_1.request)(config_1.GRAPHQL_URL, OPEN_POSITION, { symbol, position });
            return openPosition;
        });
    },
    /**
     * Change not position
     * @param position The open position
     * @returns returns a open position when status is Position
     */
    updatePosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            const { updatePosition } = yield (0, graphql_request_1.request)(config_1.GRAPHQL_URL, UPDATE_POSITION, { position });
            return updatePosition;
        });
    },
    /**
     * Change positions 'Position' to 'Exit'
     * @param symbol The Cryptocurrency unique code
     * @returns returns a open position when status is Exit
     */
    exitPosition(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const { exitPosition } = yield (0, graphql_request_1.request)(config_1.GRAPHQL_URL, EXIT_POSITION, { symbol });
            return exitPosition;
        });
    },
    /**
     * Change position 'Exit' to 'None'
     * @param symbol The Cryptocurrency unique code
     * @returns returns a open position when status is None
     */
    closePosition(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const { closePosition } = yield (0, graphql_request_1.request)(config_1.GRAPHQL_URL, CLOSE_POSITION, { symbol });
            return closePosition;
        });
    }
};
