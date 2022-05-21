import { ITimestampedValue } from './trade'
import { TradeDirection } from './strategy'
/**
 * Interface that defines an open position.
 */
export interface IPosition {
    /**
     * 
     */
    positionId?: string;
    /**
     * 
     */
    symbol: string;
    /**
     * The direction of the position.
     * long or short.
     */
    direction: TradeDirection;

    /***
     * Timestamp when the position was entered.
     */
    entryTime: Date;

    /**
     * Price when the position was entered.
     */
    entryPrice: number;

    /**
     * Net profit or loss.
     */
    profit: number;

    /**
     * Profit expressed as a percentage.
     */
    profitPct: number;

    /**
     * Profit expressed as growth.
     */
    growth: number;

    /**
     * Number of bars the position was held for.
     */
    holdingPeriod: number;

    /**
     * Initial maximum loss before exit is triggered (intrabar).
     */
    initialStopPrice?: number;

    /**
     * Current (possibly trailing) maximum loss before exit is triggered (intrabar).
     */
    curStopPrice?: number;

    /**
     * Records the stop price series, if enabled.
     */
    stopPriceSeries?: ITimestampedValue[];

    /*
     * Profit target where exit is triggered (intrabar).
     */
    profitTarget?: number;

    /**
     * Qty
     */
    amount?: number
}

export enum PositionStatus {
    None = 'None',
    Enter = 'Enter',
    Position = 'Position',
    Exit = 'Exit'
}

export interface IPositionStatus {
    symbol: string;
    direction: TradeDirection;
    conditionalEntryPrice: number | void;
    starting_capital: number;
    value: PositionStatus;
}
