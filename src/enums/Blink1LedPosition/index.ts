/**
 * Enum for blink(1) LED positions. blink(1) mk2 and mk3
 * have support for independently addressable LED's
 */
export enum Blink1LedPosition {
    /** Address all LED's */
    All = 0,
    /** Address only the top LED */
    Top = 1,
    /** Address only the bottom LED */
    Bottom = 2,
    /** Address none of the LED's */
    None = 9
}
