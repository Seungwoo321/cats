import { TradeDirection } from './strategy'

/**
 * Represents a value at a particular time.
 */
export interface ITimestampedValue {
    /**
     * Timestamp of the value.
     */
    time: Date;

    /**
     * The value at the time.
     */
    value: number;
}
