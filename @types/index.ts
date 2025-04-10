
export enum DiceOperator {
    REPEAT = "#",
    DICE = "d",
    ADD = "+",
    SUBTRACT = "-",
    MULTIPLY = "*",
    DIVIDE = "/",
    EXCLAMATION = "!",
    LEFT_PARENTHESES = "(",
    RIGHT_PARENTHESES = ")",
}

export enum SideOperator {
    GREATER_THAN = ">",
    LESS_THAN = "<",
    GREATER_THAN_OR_EQUAL = ">=",
    LESS_THAN_OR_EQUAL = "<=",
    EQUAL = "=",
    NOT_EQUAL = "!=",
}

export type DiceTokenType = 'NUMBER' | 'UNKNOWN' | keyof typeof DiceOperator | keyof typeof SideOperator;

export interface DiceToken {
    type: DiceTokenType;
    value: string;
}

export type actionsType = 'PARENTHESES' | Exclude<keyof typeof DiceOperator, 'REPEAT' | 'EXCLAMATION' | 'LEFT_PARENTHESES' |  'RIGHT_PARENTHESES'>;
export type operationsType = Exclude<actionsType, 'PARENTHESES' | 'DICE'>

export interface OperationArray {
    type: actionsType;
    value?: number;
    dices_to_roll?: {
        operation: operationsType;
        number_of_dices: number;
        dice_value: number;
        has_exclamation?: boolean;
    };
    parentheses?: {
        type: operationsType;
        value: OperationArray[]
    };
}


export interface SideProps {
    fixed_value?: number; // for right side only
    side_operator?: keyof typeof SideOperator; // for right side only
    operationArray?: OperationArray[];
    // add?: number[];
    // subtract?: number[];
    // multiply?: number[];
    // divide?: number[];
    // dices_to_roll?: {
    //     operation: 'add' | 'subtract' | 'multiply' | 'divide';
    //     number_of_dices: number;
    //     dice_value: number;
    //     has_exclamation?: boolean;
    // }[];
    // deep_in_parentheses?: SideProps[];
}

export type SideType = {
    [key in keyof SideProps]: SideProps[key];
}

export interface ParsedTokensTypes {
    number_of_tries: number;
    left_side: Omit<SideType, 'side_operator' | 'fixed_value'>;
    right_side?: SideType;
}
