import React from "react";
import styled from "@emotion/styled";
import {SimulationResults} from "./simulator";
import {EventBus} from "./App";

const Container = styled.div`
  margin: 1rem;
`

export interface OutputViewProps {
    eventBus: EventBus
}

export class OutputView extends React.Component<OutputViewProps> {

    constructor(props: OutputViewProps) {
        super(props);

        // TODO This is a total garbo hack but meh.
        props.eventBus.notifySimulationFinished = this.setSimulationResults;
    }

    render() {
        // A container with a bunch of input fields
        // each field has a right-aligned name, and a width
        return <Container>
            OutputView
        </Container>;
    }

    setSimulationResults(results: SimulationResults) {
        console.log("SETTING SIMULATION RESULTS: " + JSON.stringify(results, null, 2))
    }
}