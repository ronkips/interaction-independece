'reach 0.1';


const Player = {
    getHand: Fun([], UInt),
    seeOutcome: Fun([UInt], Null),
  };
  
  export const main = Reach.App(() => {
    const Hillary = Participant('Hillary', {
      ...Player,
      wager: UInt,
    });
    const Rop   = Participant('Rop', {
      ...Player,
      acceptWager: Fun([UInt], Null),
    });
    init();
  
    Hillary.only(() => {
      const wager = declassify(interact.wager);
      const handHillary = declassify(interact.getHand());
    });
    Hillary.publish(wager, handHillary)
      .pay(wager);
    commit();
  
    Rop.only(() => {
      interact.acceptWager(wager);
      const handRop = declassify(interact.getHand());
    });
    Rop.publish(handRop)
      .pay(wager);
  
    const outcome = (handHillary + (4 - handRop)) % 3;
    const            [forHillary, forRop] =
      outcome == 2 ? [       2,      0] :
      outcome == 0 ? [       0,      2] :
      /* tie      */ [       1,      1];
    transfer(forHillary * wager).to(Hillary);
    transfer(forRop   * wager).to(Rop);
    commit();
  
    each([Hillary, Rop], () => {
      interact.seeOutcome(outcome);
    });
  });