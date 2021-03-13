import React from 'react';
import styled from '@emotion/styled'
import {InputArray} from "./InputArray";
import {OutputView} from "./OutputView";
import { Segment } from 'semantic-ui-react'
import {SimulationFinishedEvent} from "./simulator";

const leftSegment = {
    marginRight: '0.5rem',
    marginLeft: '0px',
    marginTop: '0px',
    marginBottom: '0px',
};

const rightSegment = {
    margin: '0px'
};

const MainDiv = styled.div`
  margin: 1rem;
  display: flex;
`

export interface EventBus {
  notifySimulationFinished: SimulationFinishedEvent
}

const eventBus: EventBus = {
  notifySimulationFinished: results => { console.log("THIS SHOULD NOT HAPPEN") }
}

function App() {
  return (
    <MainDiv>
      <Segment style={leftSegment}><InputArray eventBus={eventBus}/></Segment>
      <Segment style={rightSegment}><OutputView eventBus={eventBus}/></Segment>
    </MainDiv>
  );
}

export default App;
