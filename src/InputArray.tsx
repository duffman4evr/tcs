import React from "react";
import styled from "@emotion/styled";
import {Button, Form} from "semantic-ui-react";
import {MetaGem, PotionStrategy, Rotation, simulate, SimulationInput, SpecType, Talent, Totem} from "./simulator";
import {EventBus} from "./App";

//const Container = styled.div`
//  width: 300px;
//`
//const InputPair = styled.div`
//  display: flex;
//  align-items: baseline;
//  text-align: end;
//`
//const InputLabel = styled.div`
//  width: 100px;
//`
//const InputValue = styled.div`
//  flex-grow: 1;
//`
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

export interface InputArrayProps {
    eventBus: EventBus;
}

export class InputArray extends React.Component<InputArrayProps> {

    constructor(props: InputArrayProps) {
        super(props);
    }

    render() {
        // A container with a bunch of input fields
        // each field has a right-aligned name, and a width
        //return <Container>
        //    <InputPair>
        //        <InputLabel>Spell Power:</InputLabel>
        //        <InputValue>
        //            <Input placeholder='hey'/>
        //        </InputValue>
        //    </InputPair>
        //    <SimulateButtonContainer>
        //        <Button primary onClick={() => this.readInputAndSimulate()}>Simulate!</Button>
        //    </SimulateButtonContainer>
        //</Container>;
        return <Form>
            <Form.Field>
                <label>Number of sims to run</label>
                <input id={INPUT_ID_RUN_COUNT} defaultValue='100000' />
            </Form.Field>
            <Form.Field>
                <label>Fight duration (s)</label>
                <input id={INPUT_ID_FIGHT_DURATION} defaultValue='120' />
            </Form.Field>
            <Form.Field>
                <label>Total mana</label>
                <input id={INPUT_ID_TOTAL_MANA} defaultValue='9000' />
            </Form.Field>
            <Form.Field>
                <label>Spellpower</label>
                <input id={INPUT_ID_SPELLPOWER} defaultValue='1000' />
            </Form.Field>
            <Form.Field>
                <label>Spell hit rating</label>
                <input id={INPUT_ID_SPELL_HIT_RATING} defaultValue='0' />
            </Form.Field>
            <Form.Field>
                <label>Spell crit rating</label>
                <input id={INPUT_ID_SPELL_CRIT_RATING} defaultValue='660' />
            </Form.Field>
            <Form.Field>
                <label>Spell haste rating</label>
                <input id={INPUT_ID_SPELL_HASTE_RATING} defaultValue='0' />
            </Form.Field>
            <Form.Field>
                <label>MP5</label>
                <input id={INPUT_ID_MP5} defaultValue='0' />
            </Form.Field>
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
            bloodlustOnCooldown: true,
            metaGem: MetaGem.CHAOTIC_SKYFIRE_DIAMOND,
            totem: Totem.TOTEM_OF_THE_VOID,
            potionStrategy: PotionStrategy.HASTE,
            specInfo: {
                type: SpecType.ELE_SHAMAN,
                rotation: Rotation.LB_SPAM,
                talents: {
                    [Talent.ELEMENTAL_FOCUS]: 1,
                    [Talent.CONVECTION]: 5
                }
            }
        }

        console.log("Input: " + JSON.stringify(input));

        const output = simulate(input)

        this.props.eventBus.notifySimulationFinished(output);
    }

    getIntegerField(id: string): number {
        const element = document.getElementById(id) as any;
        if (element === null) {
            throw new Error("Unexpected error, missing input.");
        }
        if (!element.hasOwnProperty('value') || typeof element.value !== 'string') {
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