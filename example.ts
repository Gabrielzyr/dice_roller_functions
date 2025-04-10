import { OperationArray } from "./@types";
import { CreateTokens, ParseTokens } from "./dice_roller";

const testeSimple1 = '5#15+5d465!+10-20-2d10>23+50d99'
const testeSimple2 = '5#15+5d465!-((d200+50)/2)+10-20-2d10>50d99'
// console.log('teste1', CreateTokens(teste1));
console.log(// CreateTokens(testeSimples),
    `String: ${testeSimple1}\n`,
    ParseTokens(CreateTokens(testeSimple1))
);


// what should be expected with parenthesis
// example: '5#15+5d465!-((d200+50)/2)+10-20-2d10>50d99'
const operationArray: OperationArray[] = [
    {
        type: 'ADD',
        value: 15,
    },
    {
        type: 'DICE',
        dices_to_roll: {
            operation: 'ADD',
            number_of_dices: 5,
            dice_value: 465,
            has_exclamation: true,
        }
    },
    {
        type: 'PARENTHESES',
        parentheses: {
            type: 'SUBTRACT',
            value: [
                {
                    type: 'PARENTHESES',
                    parentheses: {
                        type: 'ADD',
                        value: [
                            {
                                type: 'DICE',
                                dices_to_roll: {
                                    operation: 'ADD',
                                    number_of_dices: 5,
                                    dice_value: 465,
                                    has_exclamation: true,
                                }
                            },
                            {
                                type: 'ADD',
                                value: 50,
                            },
                        ]
                    }
                },
                {
                    type: 'DIVIDE',
                    value: 2,
                },
            ]
        }
    },
    {
        type: 'ADD',
        value: 10,
    },
    {
        type: 'SUBTRACT',
        value: 20,
    },
]