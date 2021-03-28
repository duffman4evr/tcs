import React from 'react';
import styled from '@emotion/styled'
import {InputArray} from "./InputArray";
import {OutputView} from "./OutputView";
import {Header, Segment} from 'semantic-ui-react'
import {SimulationFinishedEvent, SimulationStartedEvent} from "./simulator";

const leftSegment = {
    marginRight: '0.5rem',
    marginLeft: '0px',
    marginTop: '0px',
    marginBottom: '0px',
    flexGrow: '0',
    flexBasis: '30rem',
};

const MainDiv = styled.div`
  margin: 2rem;
`
const ContentDiv = styled.div`
  display: flex;
`

export interface EventBus {
    notifySimulationStarted: SimulationStartedEvent
}

const eventBus: EventBus = {
  notifySimulationStarted: () => { console.log("THIS SHOULD NOT HAPPEN notifySimulationStarted") },
}

function App() {
  return (
    <MainDiv>
        <div>
        <Header as='h2'>
            Elemental Shaman DPS Simulator
        </Header>
        </div>
        <ContentDiv>
            <Segment style={leftSegment}><InputArray eventBus={eventBus}/></Segment>
            <OutputView eventBus={eventBus}/>
        </ContentDiv>
    </MainDiv>
  );
}

export default App;
