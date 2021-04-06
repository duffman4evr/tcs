import React from "react";
import styled from "@emotion/styled";
import {Button, Dropdown, Form, Icon, Popup} from "semantic-ui-react";
import {
    BloodlustStrategy,
    MetaGem,
    PotionStrategy,
    Rotation,
    simulate,
    SimulationInput,
    SpecType,
    Talent,
    Totem
} from "./simulator";
import {EventBus} from "./App";

const SimulateButtonContainer = styled.div`
  margin: 0.5rem;
  display: flex;
  justify-content: center;
`
const INPUT_ID_FIGHT_DURATION = 'fightDuration';
const INPUT_ID_RUN_COUNT = 'runCount';
const INPUT_ID_TOTAL_MANA = 'totalMana';
const INPUT_ID_SPELLPOWER = 'spellpower';
const INPUT_ID_SPELL_HIT_RATING = 'spellHitRating';
const INPUT_ID_SPELL_CRIT_RATING = 'spellCritRating';
const INPUT_ID_SPELL_HASTE_RATING = 'spellHasteRating';
const INPUT_ID_MP5 = 'mp5';
const INPUT_ID_ROTATION = 'rotation';
const INPUT_ID_POTION_STRATEGY = 'potionStrategy';
const INPUT_ID_TOTEM = 'totem';
const INPUT_ID_META_GEM = 'metaGem';
const INPUT_ID_BLOODLUST = 'bloodlust';

export interface InputArrayProps {
    eventBus: EventBus;
}

const labelWithIcon = {
    display: 'flex',
    alignItems: 'center'
};

export interface InputArrayState {
    rotation: Rotation;
}

export class InputArray extends React.Component<InputArrayProps, InputArrayState> {

    constructor(props: InputArrayProps) {
        super(props);
        this.state = {
            rotation: Rotation.LB_SPAM
        };
    }

    render() {
        return <Form>
            <Form.Group widths='equal'>
                <Form.Field>
                    <label style={labelWithIcon}>Number of sims to run&nbsp;
                        <Popup
                            trigger={<Icon circular size='tiny' name='info' />}
                            content='The number of fights to simulate. Higher produces more reliable results. Recommend this being 10k or higher.'
                            size='small'
                        />
                    </label>
                    <input id={INPUT_ID_RUN_COUNT} defaultValue='10000' />
                </Form.Field>
                <Form.Field>
                    <label>Fight duration (s)&nbsp;
                        <Popup
                            trigger={<Icon circular size='tiny' name='info' />}
                            content='This duration is randomly increased by 0-5 seconds during each simulation run, to avoid haste breakpointing issues.'
                            size='small'
                        />
                    </label>
                    <input id={INPUT_ID_FIGHT_DURATION} defaultValue='120' />
                </Form.Field>
            </Form.Group>
            <Form.Group widths='equal'>
                <Form.Field>
                    <label>Total mana</label>
                    <input id={INPUT_ID_TOTAL_MANA} defaultValue='9000' />
                </Form.Field>
                <Form.Field>
                    <label>MP5</label>
                    <input id={INPUT_ID_MP5} defaultValue='140' />
                </Form.Field>
            </Form.Group>
            <Form.Group widths='equal'>
                <Form.Field>
                    <label>Spellpower&nbsp;
                        <Popup
                            trigger={<Icon circular size='tiny' name='info' />}
                            content='This is your total spellpower EXCEPT for any you would receive from an equipped totem (such as Totem of the Void).'
                            size='small'
                        /></label>
                    <input id={INPUT_ID_SPELLPOWER} defaultValue='1000' />
                </Form.Field>
                <Form.Field>
                    <label>Spell hit rating&nbsp;
                        <Popup
                            trigger={<Icon circular size='tiny' name='info' />}
                            content='This is the TOTAL hit rating you have, including hit from talents. The default value of 151 here is ~12% hit (which is how much you get from talents + Totem of Wrath). Each percentage of hit is 12.6 rating. The hit rating cap is 202.'
                            size='small'
                        />
                    </label>
                    <input id={INPUT_ID_SPELL_HIT_RATING} defaultValue='151' />
                </Form.Field>
            </Form.Group>
            <Form.Group widths='equal'>
                <Form.Field>
                    <label>Spell crit rating&nbsp;
                        <Popup
                            trigger={<Icon circular size='tiny' name='info' />}
                            content='This is your TOTAL spell crit rating after talents (no "hidden" crit from other sources in this calculator). Put in a number that is reasonable to you in a raid-buffed situation. 22.1 crit rating provides 1% crit chance.'
                            size='small'
                        />
                    </label>
                    <input id={INPUT_ID_SPELL_CRIT_RATING} defaultValue='660' />
                </Form.Field>
                <Form.Field>
                    <label>Spell haste rating</label>
                    <input id={INPUT_ID_SPELL_HASTE_RATING} defaultValue='0' />
                </Form.Field>
            </Form.Group>
            <Form.Field>
                <label>Rotation&nbsp;
                    <Popup
                        trigger={<Icon circular size='tiny' name='info' />}
                        content='A "haste-clipped" chain lightning is one which would have had a cast time of less than 1 second, but got forced to 1 second since that is the shortest allowable cast time in game.'
                        size='small'
                    />
                </label>
                <select id={INPUT_ID_ROTATION}>
                    <option value={Rotation.LB_SPAM} selected>Lightning Bolt Spam</option>
                    <option value={Rotation.LB_SPAM_WITH_CL}>Chain Lightning when off CD</option>
                    <option value={Rotation.LB_SPAM_WITH_CL_UNLESS_TOO_MUCH_HASTE}>Chain Lightning when off CD and won't be haste-clipped</option>
                </select>
            </Form.Field>
            <Form.Group widths='equal'>
                <Form.Field>
                    <label>Totem</label>
                    <select id={INPUT_ID_TOTEM}>
                        <option value={Totem.NONE} selected>None</option>
                        <option value={Totem.TOTEM_OF_THE_VOID}>Totem of the Void</option>
                        <option value={Totem.TOTEM_OF_THE_PULSING_EARTH}>Totem of the Pulsing Earth</option>
                    </select>
                </Form.Field>
                <Form.Field>
                    <label>Meta Gem</label>
                    <select id={INPUT_ID_META_GEM}>
                        <option value={MetaGem.NONE} selected>None</option>
                        <option value={MetaGem.CHAOTIC_SKYFIRE_DIAMOND}>Chaotic Skyfire Diamond</option>
                    </select>
                </Form.Field>
            </Form.Group>
            <Form.Group widths='equal'>
                <Form.Field>
                    <label>Potion Strategy</label>
                    <select id={INPUT_ID_POTION_STRATEGY}>
                        <option value={PotionStrategy.NONE} selected>No potions</option>
                        <option value={PotionStrategy.MANA}>Mana Potion on CD</option>
                        <option value={PotionStrategy.DESTRUCTION}>Destruction Potion on CD</option>
                    </select>
                </Form.Field>
                <Form.Field>
                    <label>Bloodlust</label>
                    <select id={INPUT_ID_BLOODLUST}>
                        <option value={BloodlustStrategy.NONE} selected>No Bloodlust</option>
                        <option value={BloodlustStrategy.AT_FIGHT_START_AND_ON_CD}>Bloodlust at fight start and on CD</option>
                    </select>
                </Form.Field>
            </Form.Group>

            <Button primary onClick={() => this.readInputAndSimulate()}>Simulate!</Button>
        </Form>
    }

    readInputAndSimulate() {
        // go through all input fields, read values as numbers.
        // Build up to a simulation query
        // read into a 'FormInput' type
        // Use the simulator to convert 'FormInput' into 'SimulationInput'

        const input: SimulationInput = {
            trace: false,
            fightDuration: this.getIntegerField(INPUT_ID_FIGHT_DURATION) * 1000,
            flightTime: 550,
            runCount: this.getIntegerField(INPUT_ID_RUN_COUNT),
            mana: this.getIntegerField(INPUT_ID_TOTAL_MANA),
            spellpower: this.getIntegerField(INPUT_ID_SPELLPOWER),
            spellCritRating: this.getIntegerField(INPUT_ID_SPELL_CRIT_RATING),
            spellHasteRating: this.getIntegerField(INPUT_ID_SPELL_HASTE_RATING),
            spellHitRating: this.getIntegerField(INPUT_ID_SPELL_HIT_RATING),
            manaPerFive: this.getIntegerField(INPUT_ID_MP5),
            bloodlustStrategy: this.getIntegerField(INPUT_ID_BLOODLUST),
            metaGem: this.getIntegerField(INPUT_ID_META_GEM),
            totem: this.getIntegerField(INPUT_ID_TOTEM),
            potionStrategy: this.getIntegerField(INPUT_ID_POTION_STRATEGY),
            specInfo: {
                type: SpecType.ELE_SHAMAN,
                rotation: this.getIntegerField(INPUT_ID_ROTATION),
                talents: {
                    [Talent.ELEMENTAL_FOCUS]: 1,
                    [Talent.CONVECTION]: 5,
                    [Talent.CONCUSSION]: 5,
                }
            }
        }

        console.log("simput: " + JSON.stringify(input));

        this.props.eventBus.notifySimulationStarted(input);
    }

    getIntegerField(id: string): number {
        const element = document.getElementById(id) as any;
        if (element === null) {
            throw new Error("Unexpected error, missing input.");
        }
        if (element.value === undefined) {
            throw new Error("Unexpected error, input has wrong shape.");
        }
        if (typeof element.value !== 'string') {
            throw new Error("Unexpected error, input has wrong shape.");
        }
        const valueString = element.value as string;
        const result = parseInt(valueString);
        if (isNaN(result)) {
            // TODO this is where we'd set errors if we wanted.
            throw new Error("Unexpected error, bad input.");
        }
        return result;
    }
}