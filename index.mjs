import { loadStdlib, ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

const isHillary = await ask.ask(
    `Are you Hillary`,
    ask.yesno
);
const who = isHillary ? `Hillary` : `Rop`;

console.log(`starting Rock, Paper, scossors as ${who}`);

let acc = null;
const createAcc = await ask.ask(
    `Would you like to create an account? ( It's only possible on devnet)`,
    ask.yesno
);
if (createAcc) {
    acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
    } else {
        const secret = await ask.ask(
            `what is your account secret?`,
            (x => x)
        );
        acc = await stdlib.newAccountFromSecret(secret);
    }

    let ctc = null;
    if (isHillary) {
        ctc = acc.contract(backend);
        ctc.getInfo().then((info) => {
            console.log(`The contract is displayed as = ${JSON.stringify(info)}`);
        });
} else {
    const info = await ask.ask(
        `Please paste the contract information:`,
        JSON.parse
    );
    ctc = acc.contract(backend, info);
}
const fmt = (x) => stdlib.formatCurrency(x, 4);
const getBalance = async() => fmt(await stdlib.balanceOf(acc));

const before = await getBalance();
console.log(`Your balance is ${before}`);

const interact = {...stdlib.hasRandom};

interact.informTimeout = () =>{
    console.log(`There was a timeout.`);
    process.exit(1);
};
//  defining a timeout handler
if (isHillary) {
    const amt = await ask.ask(
        `How much do you want to wage?`,
        stdlib.parseCurrency
    );
    interact.wager = amt;
    interact.deadLine = { ETH: 100, ALGO:100, CFX:1000, } [stdlib.connector];
} else {
    interact.acceptWager = async (amt) => {
        const accepted = await ask.ask(
            `Do you accept the wager of ${fmt(amt)}?`,
            ask.yesno
        );
        if (!accepted) {
            process.exit(0);
        }
    };
}
// request the wager amount or define the acceptwager method depending on the user
const HAND = ['Rock', 'Paper', 'Scissors'];
const HANDS = {
'Rock': 0, 'R': 0, 'r': 0,
'Paper': 1, 'P': 1, 'p': 1,
'Scissors': 2, 'S': 2, 's': 2,
} ;

interact.getHand = async () => {
    const hand = await ask.ask(`What hand will you play?`, (x) => {
        const hand = HANDS[x];
        if ( hand === undefined ){
            throw Error(`Not a valid hand please ${hand}`);
        }
        return hand; 
    });
    console.log(`You played ${HAND[hand]}`);
    return hand;
};
//we define the shared getHand method
const OUTCOME = [`Rop wins`, 'Draw', 'Hillary wins'];
interact.seeOutcome = async (outcome) => {
    console.log(`The outcome is: ${OUTCOME[outcome]}`);
};
//the see outcome method
const part = isHillary ? ctc.p.Hillary : ctc.p.Rop;
await part(interact);

const after = await getBalance();
console.log(`Your balance is now ${after}`);

ask.done();



