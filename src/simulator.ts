import TinyQueue, {Comparator} from "tinyqueue";

enum EventType {
    START_CAST,
    END_CAST,
    ARRIVE,
    MP5,
    HASTE_POTION_START,
    HASTE_POTION_END,
    DESTRUCTION_POTION_START,
    DESTRUCTION_POTION_END,
    MANA_POTION,
    BLOODLUST_START,
    BLOODLUST_END
}

enum AbilityType {
    LIGHTNING_BOLT,
    CHAIN_LIGHTNING,
    LO_LIGHTNING_BOLT,
    LO_CHAIN_LIGHTNING
}

interface Event {
    time: number,
    type: EventType,
    ability?: AbilityType
    castSnapshot?: CastSnapshot
}

interface GameState {
    playerMana: number;
    elementalFocusStacks: number;
    bloodlustCooldownComplete: number;
    potionCooldownComplete: number;
    chainLightningCooldownComplete: number;
    bloodlustActive: boolean;
    hastePotionActive: boolean;
    destructionPotionActive: boolean;
}

type NumberToNumberMap = {
    [ability: number]: number;
};

type NumberToBooleanMap = {
    [ability: number]: boolean;
};

const CAST_TIME_MAP: NumberToNumberMap = {
    [AbilityType.LIGHTNING_BOLT]: 2000,
    [AbilityType.CHAIN_LIGHTNING]: 1500
}

const BASE_DAMAGE_MAP: NumberToNumberMap = {
    [AbilityType.LIGHTNING_BOLT]: 563,
    [AbilityType.CHAIN_LIGHTNING]: 734,
    [AbilityType.LO_LIGHTNING_BOLT]: 563,
    [AbilityType.LO_CHAIN_LIGHTNING]: 734
}

const DAMAGE_RANGE_MAP: NumberToNumberMap = {
    [AbilityType.LIGHTNING_BOLT]: 81,
    [AbilityType.CHAIN_LIGHTNING]: 105,
    [AbilityType.LO_LIGHTNING_BOLT]: 81,
    [AbilityType.LO_CHAIN_LIGHTNING]: 105
}

const COEFFICIENT_MAP: NumberToNumberMap = {
    [AbilityType.LIGHTNING_BOLT]: 0.797,
    [AbilityType.CHAIN_LIGHTNING]: 0.643,
    [AbilityType.LO_LIGHTNING_BOLT]: 0.797,
    [AbilityType.LO_CHAIN_LIGHTNING]: 0.643
}

const MANA_COST_MAP: NumberToNumberMap = {
    [AbilityType.LIGHTNING_BOLT]: 300,
    [AbilityType.CHAIN_LIGHTNING]: 760,
    [AbilityType.LO_LIGHTNING_BOLT]: 0,
    [AbilityType.LO_CHAIN_LIGHTNING]: 0,
}

const FLIGHT_TIME_SPELLS: NumberToBooleanMap = {
    [AbilityType.LIGHTNING_BOLT]: true,
    [AbilityType.CHAIN_LIGHTNING]: false,
    [AbilityType.LO_LIGHTNING_BOLT]: true,
    [AbilityType.LO_CHAIN_LIGHTNING]: false
}

const LIGHTNING_OVERLOAD_MAP: NumberToNumberMap = {
    [AbilityType.LIGHTNING_BOLT]: AbilityType.LO_LIGHTNING_BOLT,
    [AbilityType.CHAIN_LIGHTNING]: AbilityType.LO_CHAIN_LIGHTNING,
}

const IS_LO_SPELL: NumberToBooleanMap = {
    [AbilityType.LIGHTNING_BOLT]: false,
    [AbilityType.CHAIN_LIGHTNING]: false,
    [AbilityType.LO_LIGHTNING_BOLT]: true,
    [AbilityType.LO_CHAIN_LIGHTNING]: true
}

const eventComparator: Comparator<Event> = (a: Event, b: Event) => {
    if (a.time !== b.time) {
        // If times differ, then whatever happens first comes first.
        return a.time - b.time;
    } else {
        // If events happen at the same time, break ties with a priority system.
        return EVENT_TYPE_TO_PRIORITY_MAP[a.type] - EVENT_TYPE_TO_PRIORITY_MAP[b.type];
    }
}

const SPELL_CRIT_RATING_PER_PERCENT = 22.1;
const SPELL_HASTE_RATING_PER_PERCENT = 15.8;
const SPELL_HIT_RATING_PER_PERCENT = 12.6;

const SPELL_CRIT_RATING_CAP = 2210;
const SPELL_HIT_RATING_CAP = 201.6;

const FIGHT_DURATION_HARD_CAP = 20*60*1000;

const SUPER_MANA_POTION_BASE = 1800;
const SUPER_MANA_POTION_RANGE = 1200;

// Given EP value of 1 crit rating, multiply by this to get EP value of int.
const INT_TO_CRIT_RATING_EP_RATIO = 0.27625

const EVENT_TYPE_TO_PRIORITY_MAP: NumberToNumberMap = {
    [EventType.START_CAST]: 1000,
    [EventType.END_CAST]: 900,
    [EventType.ARRIVE]: 800,
    [EventType.MANA_POTION]: 101,
    [EventType.HASTE_POTION_START]: 101,
    [EventType.HASTE_POTION_END]: 101,
    [EventType.DESTRUCTION_POTION_START]: 101,
    [EventType.DESTRUCTION_POTION_END]: 101,
    [EventType.MP5]: 100,
    [EventType.BLOODLUST_START]: 99,
    [EventType.BLOODLUST_END]: 99,
};


export enum SpecType {
    ELE_SHAMAN
}

export enum Talent {
    ELEMENTAL_FOCUS,
    CONVECTION,
    CONCUSSION,
}

export enum MetaGem {
    NONE,
    CHAOTIC_SKYFIRE_DIAMOND,
}

export enum Totem {
    NONE,
    TOTEM_OF_THE_PULSING_EARTH,
    TOTEM_OF_THE_VOID,
}

export enum Rotation {
    LB_SPAM,
    LB_SPAM_WITH_CL,
    LB_SPAM_WITH_CL_UNLESS_TOO_MUCH_HASTE
}

export enum PotionStrategy {
    MANA,
    DESTRUCTION,
    NONE,
}

export enum BloodlustStrategy {
    NONE,
    AT_FIGHT_START_AND_ON_CD,
}

export interface SpecInfo {
    type: SpecType;
    rotation: Rotation;
    talents: NumberToNumberMap;
}

export interface SimulationInput {
    trace: boolean;
    fightDuration: number;
    flightTime: number;
    runCount: number;
    mana: number;
    spellpower: number;
    spellCritRating: number;
    spellHasteRating: number;
    spellHitRating: number;
    manaPerFive: number;
    metaGem: MetaGem;
    bloodlustStrategy: BloodlustStrategy;
    totem: Totem;
    potionStrategy: PotionStrategy;
    specInfo: SpecInfo;
}

export interface SingleSimulationResult {
    averageDps: number;
    oomTime?: number;
}

export interface MultiSimulationResult {
    averageDps: number;
    averageDpsPerSimulation: number[];
    averageTimeToOom?: number;
    neverOomRatio: number;
}

export interface SimulationResults {
    averageDps: number;
    averageDpsPerSimulation: number[];
    averageTimeToOom?: number;
    neverOomRatio: number;
    dpsPerEp: number;
    spellpowerEp: number;
    spellCritRatingEp: number;
    spellHasteRatingEp: number;
    spellHitRatingEp: number;
    intellectEp: number;
    timeTakenToSimulate: number;
}

export interface CastSnapshot {
    isHit: boolean;
    isCrit: boolean;
    damage: number;
}

export interface SimulationFinishedEvent {
    (results: SimulationResults): void
}

export interface SimulationStartedEvent {
    (input: SimulationInput): void
}

export function simulate(input: SimulationInput) : SimulationResults {

    const startTime = Date.now();

    if (input.trace) {
        // Force run count to 1 if we are tracing, to keep logs short.
        input.runCount = 1;
    }

    let spellpowerModifier = 1000;
    let spellCritRatingModifier = 220;
    let spellHasteRatingModifier = 200;
    let spellHitRatingModifier = 60;

    const hitIsCapped = input.spellHitRating >= SPELL_HIT_RATING_CAP;
    const modifiedSpellCritBreaksCap = (input.spellCritRating + spellCritRatingModifier) > SPELL_CRIT_RATING_CAP;
    const modifiedSpellHitBreaksCap = (input.spellHitRating + spellHitRatingModifier) > SPELL_HIT_RATING_CAP;

    if (modifiedSpellCritBreaksCap) {
        spellCritRatingModifier = -1 * spellCritRatingModifier;
        if ((input.spellCritRating + spellCritRatingModifier) < 0) {
            throw "Stop with the ridiculous numbers."
        }
    }
    if (modifiedSpellHitBreaksCap) {
        spellHitRatingModifier = -1 * spellHitRatingModifier;
        if ((input.spellHitRating + spellHitRatingModifier) < 0) {
            throw "Stop with the ridiculous numbers."
        }
    }

    const modifiedSpellpowerInput: SimulationInput = {
        ...input,
        spellpower: input.spellpower + spellpowerModifier
    }
    const modifiedSpellCritInput: SimulationInput = {
        ...input,
        spellCritRating: input.spellCritRating + spellCritRatingModifier
    }
    const modifiedSpellHasteInput: SimulationInput = {
        ...input,
        spellHasteRating: input.spellHasteRating + spellHasteRatingModifier
    }
    const modifiedSpellHitInput: SimulationInput = {
        ...input,
        spellHitRating: input.spellHitRating + spellHitRatingModifier
    }

    const results = simulateManyFights(input);
    const averageDps = results.averageDps;

    if (input.trace) {
        return {
            averageDps: averageDps,
            averageDpsPerSimulation: [averageDps],
            averageTimeToOom: results.averageTimeToOom,
            neverOomRatio: results.neverOomRatio,
            dpsPerEp: 0,
            spellpowerEp: 1,
            spellCritRatingEp: 0,
            spellHasteRatingEp: 0,
            spellHitRatingEp: 0,
            intellectEp: 0,
            timeTakenToSimulate: Date.now() - startTime,
        };
    }

    const averageDpsWithModifiedSpellpower = simulateManyFights(modifiedSpellpowerInput).averageDps;
    const averageDpsWithModifiedSpellCritRating = simulateManyFights(modifiedSpellCritInput).averageDps;
    const averageDpsWithModifiedSpellHasteRating = simulateManyFights(modifiedSpellHasteInput).averageDps;
    const averageDpsWithModifiedSpellHitRating = hitIsCapped ? 0 : simulateManyFights(modifiedSpellHitInput).averageDps

    const dpsPerEquivalencePoint = (averageDpsWithModifiedSpellpower - averageDps) / spellpowerModifier;
    const dpsPerSpellCritRating = (averageDpsWithModifiedSpellCritRating - averageDps) / spellCritRatingModifier;
    const dpsPerSpellHasteRating = (averageDpsWithModifiedSpellHasteRating - averageDps) / spellHasteRatingModifier;
    const dpsPerSpellHitRating = (averageDpsWithModifiedSpellHitRating - averageDps) / spellHitRatingModifier;

    const epPerSpellCritRating = dpsPerSpellCritRating / dpsPerEquivalencePoint;
    const epPerSpellHasteRating = dpsPerSpellHasteRating / dpsPerEquivalencePoint;
    const epPerSpellHitRating = dpsPerSpellHitRating / dpsPerEquivalencePoint;

    return {
        averageDps: averageDps,
        averageDpsPerSimulation: results.averageDpsPerSimulation,
        averageTimeToOom: results.averageTimeToOom,
        neverOomRatio: results.neverOomRatio,
        spellpowerEp: 1,
        dpsPerEp: dpsPerEquivalencePoint,
        spellCritRatingEp: epPerSpellCritRating,
        spellHasteRatingEp: epPerSpellHasteRating,
        spellHitRatingEp: hitIsCapped ? 0 : epPerSpellHitRating,
        intellectEp: epPerSpellCritRating * INT_TO_CRIT_RATING_EP_RATIO,
        timeTakenToSimulate: Date.now() - startTime
    };
}

function simulateManyFights(input: SimulationInput): MultiSimulationResult {
    const runCount = input.runCount;
    const dpsAverages: number[] = [];
    const timesToOom: number[] = [];
    let neverOomCount: number = 0;

    for (let i = 0; i < runCount; i++) {
        const result = simulateSingleFight(input);
        dpsAverages.push(result.averageDps)
        if (result.oomTime !== undefined) {
            timesToOom.push(result.oomTime)
        } else {
            neverOomCount++;
        }
    }

    const averageDps = dpsAverages.reduce((a, b) => a + b) / runCount;
    const averageTimeToOom = timesToOom.length === 0 ? undefined : timesToOom.reduce((a, b) => a + b) / timesToOom.length;
    const neverOomRatio = neverOomCount / runCount;

    return {
        averageDps: averageDps,
        averageDpsPerSimulation: dpsAverages,
        averageTimeToOom: averageTimeToOom,
        neverOomRatio: neverOomRatio,
    }
}

function simulateSingleFight(input: SimulationInput): SingleSimulationResult {

    const queue = new TinyQueue(undefined, eventComparator);
    const gameState: GameState = {
        playerMana: input.mana,
        elementalFocusStacks: 0,
        chainLightningCooldownComplete: 0,
        bloodlustCooldownComplete: 0,
        potionCooldownComplete: 0,
        bloodlustActive: false,
        hastePotionActive: false,
        destructionPotionActive: false,
    }

    queue.push({
        time: 0,
        type: EventType.START_CAST,
        ability: AbilityType.LIGHTNING_BOLT
    });

    // Mana regens every two seconds. To better simulate, we pick a random time between [0 and 2) to be the first
    // tick. From there, every tick happens 2 seconds after the previous tick.
    const firstManaTickTime = Math.floor(Math.random() * 2000);
    const manaPerTick = input.manaPerFive / 2.5;

    queue.push({
        time: firstManaTickTime,
        type: EventType.MP5,
        ability: undefined
    });

    // Jitter the fight duration by up to + 5 seconds to account for bullshit
    // timing cutoffs where haste would 'breakpoint' and be way better.
    const jitteredFightDuration = input.fightDuration + Math.floor(Math.random() * 5000)

    let totalDamageDone: number = 0;
    let oomTime: number | undefined = undefined;

    while (queue.length > 0) {

    //for (let i = 0; i < 1000; i++) {

        const event = queue.pop();

        //console.log("event " + JSON.stringify(event));

        if (!event) {
            throw "This is bullocks."
        }

        if (oomTime) {
            // We have already gone oom. The simulation should end once we have gone past the jittered fight duration.
            if (event.time > jitteredFightDuration) {
                logIfTrace(input, () => "= Fight is OVER due to time running out. OOM time was found. =");
                break;
            }
        } else {
            // We have not gone oom yet. The simulation should end if the current time is past a hard-cap.
            if (event.time > FIGHT_DURATION_HARD_CAP) {
                logIfTrace(input, () => "= Fight is OVER due to hard cap. No OOM time was found. =");
                break;
            }
        }

        switch (event.type) {
            case EventType.START_CAST:
            {
                if (event.ability === undefined) {
                    throw new Error("ugh.")
                }

                if (input.bloodlustStrategy === BloodlustStrategy.AT_FIGHT_START_AND_ON_CD
                    && gameState.bloodlustCooldownComplete <= event.time) {
                    queue.push({
                        time: event.time,
                        type: EventType.BLOODLUST_START
                    })
                    queue.push(event);
                    break;
                }

                if (input.potionStrategy === PotionStrategy.DESTRUCTION && gameState.potionCooldownComplete <= event.time) {
                    queue.push({
                        time: event.time,
                        type: EventType.DESTRUCTION_POTION_START
                    })
                    queue.push(event);
                    break;
                }

                if ((input.potionStrategy === PotionStrategy.MANA) &&
                    (gameState.potionCooldownComplete <= event.time) &&
                    ((input.mana - gameState.playerMana) > 3000)
                ) {
                    queue.push({
                        time: event.time,
                        type: EventType.MANA_POTION
                    })
                    queue.push(event);
                    break;
                }

                logIfTrace(input, () => `[${event.time}] Start casting ${AbilityType[event.ability!]}. Gamestate is ${JSON.stringify(gameState)}`)

                // Mark that the player went oom, if necessary.
                const manaCost = getManaCost(event.ability, gameState, event.type, input);
                logIfTrace(input, () => `Mana cost of this cast is ${manaCost}`);

                if (oomTime === undefined && (gameState.playerMana < manaCost)) {
                    oomTime = event.time;
                    logIfTrace(input, () => `OOM time recorded as ${oomTime}`);
                }

                // Apply haste and put up an end-cast event for when it should end.
                const baseCastTime = CAST_TIME_MAP[event.ability];
                const totalHasteRating = input.spellHasteRating + (gameState.hastePotionActive ? 400 : 0);
                const hasteRatingModifier = 1 + ((totalHasteRating / SPELL_HASTE_RATING_PER_PERCENT) / 100);
                const bloodlustModifier = gameState.bloodlustActive ? 1.3 : 1.0;
                const castSpeedModifier = hasteRatingModifier * bloodlustModifier;
                const castTime = Math.max(1000, Math.round(baseCastTime / castSpeedModifier));

                const endCastEvent: Event = {
                    time: event.time + castTime,
                    type: EventType.END_CAST,
                    ability: event.ability
                };

                logIfTrace(input, () => `This cast will end at ${endCastEvent.time}`);

                queue.push(endCastEvent);

                // Case break.
                break;
            }
            case EventType.END_CAST:
            {
                if (event.ability === undefined) {
                    throw new Error("ugh.")
                }

                // Subtract mana
                logIfTrace(input, () => `[${event.time}] Finish casting ${AbilityType[event.ability!]}. Gamestate is ${JSON.stringify(gameState)}`)
                const manaCost = getManaCost(event.ability, gameState, event.type, input);
                gameState.playerMana = gameState.playerMana - manaCost;
                logIfTrace(input, () => `Spent ${manaCost} mana on this cast. Gamestate is now ${JSON.stringify(gameState)}`)

                // Update cooldowns
                if (event.ability === AbilityType.CHAIN_LIGHTNING) {
                    gameState.chainLightningCooldownComplete = event.time + 6000;
                }

                // Build a 'cast snapshot' which contains dmg, and whether it hit/crit.
                // This mimic's 'snapshotting' behavior in the game.
                const castSnapshot = buildCastSnapshot(event, input, gameState);

                // Set up event for the spell 'arriving'
                if (FLIGHT_TIME_SPELLS[event.ability]) {
                    const arrivalEvent: Event = {
                        time: event.time + input.flightTime,
                        type: EventType.ARRIVE,
                        ability: event.ability,
                        castSnapshot: castSnapshot
                    };
                    logIfTrace(input, () => `This cast will arrive at ${arrivalEvent.time}`);
                    queue.push(arrivalEvent);
                } else {
                    queue.push({
                        time: event.time,
                        type: EventType.ARRIVE,
                        ability: event.ability,
                        castSnapshot: castSnapshot
                    });
                }

                // Set up events for next spell.
                const nextStartCastEvent = getNextCastEvent(event, input, gameState);
                if (nextStartCastEvent !== undefined) {
                    queue.push(nextStartCastEvent);
                }

                // Case break.
                break;
            }
            case EventType.ARRIVE:
            {
                if (event.ability === undefined) {
                    throw new Error("ugh.")
                }

                if (event.castSnapshot === undefined) {
                    throw new Error("ARRIVE event must have a cast snapshot.");
                }

                logIfTrace(input, () => `[${event.time}] ${AbilityType[event.ability!]} arrived at boss. Gamestate is ${JSON.stringify(gameState)}`)

                const lightningOverloadProc = Math.random() < 0.2;

                if (lightningOverloadProc) {
                    const loAbility = LIGHTNING_OVERLOAD_MAP[event.ability];
                    if (loAbility !== undefined) {
                        logIfTrace(input, () => `Lightning Overload proc'd for ${AbilityType[event.ability!]}.`);
                        const lightningOverloadCast: Event = {
                            time: event.time,
                            type: EventType.END_CAST,
                            ability: loAbility,
                        };
                        queue.push(lightningOverloadCast);
                    }
                }

                const castSnapshot = event.castSnapshot;

                if (castSnapshot.isCrit && (input.specInfo.talents[Talent.ELEMENTAL_FOCUS] === 1)) {
                    gameState.elementalFocusStacks = 2;
                    logIfTrace(input, () => `Elemental focus stacks reset due to crit. Gamestate is ${JSON.stringify(gameState)}`);
                }

                logIfTrace(input, () => `${castSnapshot.damage} damage was done.`);

                const isFightOver = event.time > jitteredFightDuration;

                if (!isFightOver) {
                    totalDamageDone += castSnapshot.damage;
                } else {
                    logIfTrace(input, () => `The damage was not added to the total since the fight is over.`);
                }

                // Case break.
                break;
            }
            case EventType.MP5:
            {
                logIfTrace(input, () => `[${event.time}] Mana tick for ${manaPerTick}. Gamestate is ${JSON.stringify(gameState)}`)

                gameState.playerMana += manaPerTick;

                logIfTrace(input, () => `Mana added. Gamestate is ${JSON.stringify(gameState)}`)

                const nextManaTick: Event = {
                    time: event.time + 2000,
                    type: EventType.MP5,
                };

                queue.push(nextManaTick);

                // Case break.
                break;
            }
            case EventType.MANA_POTION:
            {
                const manaRecovered = SUPER_MANA_POTION_BASE + Math.floor(SUPER_MANA_POTION_RANGE * Math.random());
                gameState.playerMana += manaRecovered
                gameState.potionCooldownComplete = event.time + (2 * 60 * 1000);

                logIfTrace(input, () => `Super mana potion rolled ${manaRecovered}, added to player mana. Gamestate is ${JSON.stringify(gameState)}`);

                break;
            }
            case EventType.BLOODLUST_START:
            {
                logIfTrace(input, () => `[${event.time}] Bloodlust START`);
                gameState.bloodlustActive = true;
                gameState.bloodlustCooldownComplete = event.time + 300000;

                const bloodlustEndEvent: Event = {
                    time: event.time + 40000,
                    type: EventType.BLOODLUST_END,
                };

                queue.push(bloodlustEndEvent)
                break;
            }
            case EventType.BLOODLUST_END:
            {
                logIfTrace(input, () => `[${event.time}] Bloodlust END`);
                gameState.bloodlustActive = false;
                break;
            }
            case EventType.HASTE_POTION_START:
            {
                logIfTrace(input, () => `[${event.time}] Haste Potion START`);

                gameState.hastePotionActive = true;

                const hastePotionEndEvent: Event = {
                    time: event.time + 15000,
                    type: EventType.HASTE_POTION_END,
                };

                gameState.potionCooldownComplete = event.time + 120000;

                queue.push(hastePotionEndEvent)

                break;
            }
            case EventType.HASTE_POTION_END:
            {
                logIfTrace(input, () => `[${event.time}] Haste Potion END`);
                gameState.hastePotionActive = false;
                break;
            }
            case EventType.DESTRUCTION_POTION_START:
            {
                logIfTrace(input, () => `[${event.time}] Destruction Potion START`);

                gameState.destructionPotionActive = true;

                const endEvent: Event = {
                    time: event.time + 15000,
                    type: EventType.DESTRUCTION_POTION_END,
                };

                gameState.potionCooldownComplete = event.time + 120000;

                queue.push(endEvent)

                break;
            }
            case EventType.DESTRUCTION_POTION_END:
            {
                logIfTrace(input, () => `[${event.time}] Destruction Potion END`);
                gameState.destructionPotionActive = false;
                break;
            }
        }
    }

    logIfTrace(input, () => `= The jittered fight duration for this fight is ${jitteredFightDuration} =`)
    logIfTrace(input, () => `= Total damage done is ${totalDamageDone} =`)

    return {
        averageDps: totalDamageDone / (jitteredFightDuration / 1000),
        oomTime: oomTime
    }
}

function logIfTrace(input: SimulationInput, logLineGenerator: () => string) {
    if (input.trace) {
        console.log(logLineGenerator())
    }
}

// I hate this function
function getManaCost(ability: AbilityType, gameState: GameState, eventType: EventType, input: SimulationInput) : number {
    const baseManaCost = MANA_COST_MAP[ability];
    const manaCostTalentMultiplier = 1 - (0.02 * input.specInfo.talents[Talent.CONVECTION]);
    const manaCostClearcastingMultiplier = gameState.elementalFocusStacks > 0 ? 0.6 : 1;
    const manaCostModifier = input.totem === Totem.TOTEM_OF_THE_PULSING_EARTH ? -27 : 0;
    const manaCost = (baseManaCost * manaCostTalentMultiplier * manaCostClearcastingMultiplier) + manaCostModifier;
    if (gameState.elementalFocusStacks > 0 && eventType === EventType.END_CAST) {
        gameState.elementalFocusStacks--;
    }
    return Math.ceil(manaCost);
}

function getCastSpeedModifier(input: SimulationInput, gameState: GameState): number {
    const totalHasteRating = input.spellHasteRating + (gameState.hastePotionActive ? 400 : 0);
    const hasteRatingModifier = 1 + ((totalHasteRating / SPELL_HASTE_RATING_PER_PERCENT) / 100);
    const bloodlustModifier = gameState.bloodlustActive ? 1.3 : 1.0;
    const castSpeedModifier = hasteRatingModifier * bloodlustModifier;
    return castSpeedModifier;
}

function buildCastSnapshot(event: Event, input: SimulationInput, gameState: GameState): CastSnapshot {

    if (event.ability === undefined) {
        throw new Error("Event missing ability.");
    }

    // Roll hit
    const hitPercent = 83 + Math.min((input.spellHitRating / SPELL_HIT_RATING_PER_PERCENT), 16);
    const isHit = Math.random() < (hitPercent / 100);

    logIfTrace(input, () => `The spell will ${isHit ? 'hit' : 'miss'}. It had a ${hitPercent}% chance to hit.`);

    if (!isHit) {
        return {
            isHit: false,
            isCrit: false,
            damage: 0,
        }
    }

    // Roll crit.
    const spellCritPercent = (input.spellCritRating / SPELL_CRIT_RATING_PER_PERCENT)
        + (gameState.destructionPotionActive ? 2 : 0);
    const isCrit = Math.random() < (spellCritPercent / 100);

    logIfTrace(input, () => `The spell will ${isCrit ? 'crit' : 'not crit'}. It had a ${spellCritPercent}% chance to crit.`);

    const critMultiplier = isCrit ? (input.metaGem === MetaGem.CHAOTIC_SKYFIRE_DIAMOND ? 2.09 : 2) : 1;

    // Figure out if we are dealing with a lightning overload spell.
    const lightningOverloadMultiplier = IS_LO_SPELL[event.ability] ? 0.5 : 1;

    // Roll damage
    const baseDamage = BASE_DAMAGE_MAP[event.ability];
    const damageRoll = Math.random() * (DAMAGE_RANGE_MAP[event.ability] + 1);
    const rawBonusDamage = input.spellpower
        + ((input.totem === Totem.TOTEM_OF_THE_VOID) ? 55 : 0)
        + (gameState.destructionPotionActive ? 150 : 0);
    const coefficient = COEFFICIENT_MAP[event.ability] * (1 + (0.01 * input.specInfo.talents[Talent.CONCUSSION]));
    const bonusDamage = coefficient * rawBonusDamage;
    const damage = (baseDamage + damageRoll + bonusDamage) * critMultiplier * lightningOverloadMultiplier;
    const flooredDamage = Math.floor(damage);

    return {
        isHit: true,
        isCrit: isCrit,
        damage: flooredDamage
    }
}

/**
 * This code essentially implements the 'rotation'.
 */
function getNextCastEvent(currentEvent: Event, input: SimulationInput, gameState: GameState): Event | undefined {

    // There is no next cast for a lightning overload ability.
    if (currentEvent.ability === undefined
        || currentEvent.ability === AbilityType.LO_CHAIN_LIGHTNING
        || currentEvent.ability === AbilityType.LO_LIGHTNING_BOLT) {
        return undefined;
    }

    let nextAbility = AbilityType.LIGHTNING_BOLT;

    if (currentEvent.time >= gameState.chainLightningCooldownComplete) {
        if (input.specInfo.rotation === Rotation.LB_SPAM_WITH_CL) {
            nextAbility = AbilityType.CHAIN_LIGHTNING;
        } else if (input.specInfo.rotation === Rotation.LB_SPAM_WITH_CL_UNLESS_TOO_MUCH_HASTE) {
            const castSpeedModifier = getCastSpeedModifier(input, gameState);
            if (castSpeedModifier < 1.5) {
                nextAbility = AbilityType.CHAIN_LIGHTNING;
            }
        }
    }

    const nextStartCastEvent: Event = {
        time: currentEvent.time,
        type: EventType.START_CAST,
        ability: nextAbility,
    };

    return nextStartCastEvent;
}