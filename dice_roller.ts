import { DiceOperator, DiceToken, DiceTokenType, operationsType, ParsedTokensTypes, SideOperator, SideType } from "./@types";

function getOperatorType<T extends Record<string, string>>(enumValues: T, char: string): DiceTokenType {
    return (Object.keys(enumValues)as DiceTokenType[]).find((key) => enumValues[key as keyof T] === char) ?? "UNKNOWN"
}

export function CreateTokens(str: string): DiceToken[] {
    let tokens: DiceToken[] = [];
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (!isNaN(Number(char))) {
            tokens.push({ type: "NUMBER", value: char });
        } 
        if (isNaN(Number(char))) {
            const val = getOperatorType(DiceOperator, char);
            tokens.push({ type: val !== "UNKNOWN" ? val : getOperatorType(SideOperator, char), value: char });
        }
    }
    return tokens;
}


function joinNumbers(tokens: DiceToken[], current: number ): [string, number, boolean] {
    let buildingString = '';
    let hasExclamation = false;
    if (tokens[current].type === "NUMBER") {
        const buildingStringNumber: string[] = [];
        while (tokens[current] && tokens[current].type === "NUMBER") {
            buildingStringNumber.push(tokens[current].value);
            current++;
        }
        buildingString = buildingStringNumber.join("");
    }
    if (tokens[current] && tokens[current].type === "EXCLAMATION") {
        hasExclamation = true;
        current++;
    }
    return [buildingString, current, hasExclamation];
}


function sideParser(
    tokens: DiceToken[],
    current: number = 0, 
    onGoing?: string,
    currentParsed: SideType = {},
    operation?: operationsType,
    depth?: number
): [SideType, number] {
    let parsedTokens = currentParsed;
    let buildingString = onGoing || ''
    if (!tokens[current] || SideOperator[tokens[current].type as keyof typeof SideOperator])
        return [parsedTokens, current];
    if (buildingString.length && isNaN(Number(buildingString))) {
        // aaaaaaa
        // console.log('isNaN')
        current++;
    }
    if (!buildingString.length) {
        const [numbers, newCurrent] = joinNumbers(tokens, current);
        buildingString = numbers
        current = newCurrent;
    }
    switch (tokens[current].type) {
        case 'ADD':
        case 'SUBTRACT':
        case 'DIVIDE':
        case 'MULTIPLY':
            if (buildingString.length > 0 && operation) {
                parsedTokens = {
                    ...parsedTokens,
                    operationArray: [
                        ...(parsedTokens.operationArray || []),
                        {
                            type: operation,
                            value: Number(buildingString)
                        }
                    ]
                }
                buildingString = '';
                return sideParser(tokens, current+1, buildingString, parsedTokens, tokens[current].type as operationsType);
            } else return sideParser(tokens, current+1, buildingString, parsedTokens, tokens[current].type as operationsType);
        case 'DICE':
            const [numbers, newCurrent, hasExclamation] = joinNumbers(tokens, current+1);
            current = newCurrent;
            parsedTokens = {
                ...parsedTokens,
                operationArray: [
                    ...(parsedTokens.operationArray || []),
                    {
                        type: 'DICE',
                        dices_to_roll: {
                            operation: operation ?? 'ADD',
                            number_of_dices: Number(buildingString),
                            dice_value: Number(numbers),
                            has_exclamation: hasExclamation
                        }
                    }
                ]
            }
        // case 'LEFT_PARENTHESES':
        //     console.log('teste', tokens[current])
        //     return sideParser(tokens, current+1, buildingString, parsedTokens, tokens[current]?.type as operationsType)
            
        // case 'RIGHT_PARENTHESES':
        //     console.log('teste', tokens[current])
        //     return sideParser(tokens, current+1, buildingString, parsedTokens, tokens[current]?.type as operationsType)

        default:
            break;
    }
    if (tokens[current]?.type === 'GREATER_THAN') console.log('AAAAAAAAA')
    if (tokens[current])
        return sideParser(tokens, current, undefined, parsedTokens);
    return [parsedTokens, current];
}
export function ParseTokens(tokens: DiceToken[], current: number = 0): ParsedTokensTypes {
    let parsedTokens: ParsedTokensTypes = {
        number_of_tries: 1,
        left_side: {},
        right_side: {}
    };
    let [ possible_repetition, firstCurrent ] = joinNumbers(tokens, current);
    current = firstCurrent;
    // Check for repetition
    if (tokens[current].type === "REPEAT") {
        parsedTokens.number_of_tries = Number(possible_repetition);
        current++;
        possible_repetition = '';
    }

    if (current !== 0) {
        // This will add the + value on the beginning of the string
        if (tokens[current].type === "NUMBER") {
            tokens.splice(current, 0, {
                type: "ADD",
                value: "+"
            });
        }
    }

    const [sideParsed, newCurrent] = sideParser(
        tokens, current, possible_repetition.length > 0 
            ? possible_repetition : undefined
    )
    current = newCurrent;
    parsedTokens = {
        ...parsedTokens,
        left_side: {
            ...sideParsed
        }
    }
    // check if has right side
    if (tokens[current] && SideOperator[tokens[current].type as keyof typeof SideOperator]) {
        console.log('has right side', current, tokens[current].type, SideOperator[tokens[current].type as keyof typeof SideOperator]);
        if (tokens[current+1].type === "NUMBER") {
            tokens.splice(current+1, 0, {
                type: "ADD",
                value: "+"
            });
        }
        const [sideParsed, _] = sideParser(tokens, current+1)
        parsedTokens = {
            ...parsedTokens,
            right_side: {
                ...sideParsed,
                side_operator: tokens[current].type as keyof typeof SideOperator,
                
            }
        }
    }

    return parsedTokens;
}
