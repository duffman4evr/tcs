import React from "react";
import styled from "@emotion/styled";
import {simulate, SimulationInput, SimulationResults} from "./simulator";
import {EventBus} from "./App";
import PlotlyChart from "react-plotlyjs-ts";
import {Header, Statistic, Message, Divider, Icon, Popup, Segment} from "semantic-ui-react";

const EpsFlexbox = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const margin = {
    marginTop: '0.5rem',
};

const textTop = {
    verticalAlign: 'text-top',
};

export interface OutputViewProps {
    eventBus: EventBus
}

export interface OutputViewState {
    simulationResults?: SimulationResults;
    simulationInput?: SimulationInput;
}

const rightSegment = {
    margin: '0px',
    flexGrow: '1',
};

export class OutputView extends React.Component<OutputViewProps, OutputViewState> {

    constructor(props: OutputViewProps) {
        super(props, {});
        this.state = {};

        props.eventBus.notifySimulationStarted = this.startNewSimulation.bind(this);
    }

    render() {
        // A container with a bunch of input fields
        // each field has a right-aligned name, and a width

        const results = this.state.simulationResults;
        const simulatingCurrently = this.state.simulationInput !== undefined;
        console.log("rerender, simulatingCurrently = " + simulatingCurrently);

        if (results === undefined) {
            console.log("rerender without results")
            if (simulatingCurrently) {
                return <Segment loading style={rightSegment} placeholder>
                    <Header icon>
                        <Icon name='area graph' />
                        Enter your input and hit 'Simulate!' on the left
                    </Header>
                </Segment>
            } else {
                return <Segment style={rightSegment} placeholder>
                    <Header icon>
                        <Icon name='area graph'/>
                        Enter your input and hit 'Simulate!' on the left
                    </Header>
                </Segment>
            }
        }

        const data = [
            {
                x: results.averageDpsPerSimulation,
                type: 'histogram'
            }
        ]

        const layout = {
            xaxis: {
                title: 'DPS',
                zeroline: false
            },
            yaxis: {
                title: 'Simulation Count'
            },
        };
        return (
            <Segment loading={simulatingCurrently} style={rightSegment}>
                <div>
                    <Statistic horizontal size='huge'>
                        <Statistic.Value>{results.averageDps.toFixed(1)}</Statistic.Value>
                        <Statistic.Label>Average DPS</Statistic.Label>
                    </Statistic>
                </div>
                <div>
                    <Statistic style={margin} horizontal>
                        <Statistic.Value>{results.averageTimeToOom === undefined ? '∞' : (results.averageTimeToOom / 1000).toFixed(1)}</Statistic.Value>
                        <Statistic.Label>Seconds until OOM</Statistic.Label>
                    </Statistic>
                </div>
                <Header dividing as='h2'>Equivalence Points</Header>
                <EpsFlexbox>
                    <Statistic size='small'>
                        <Statistic.Value>{results.spellpowerEp.toFixed(0)}</Statistic.Value>
                        <Statistic.Label>Spell Damage</Statistic.Label>
                    </Statistic>
                    <Statistic size='small'>
                        <Statistic.Value>{results.spellHitRatingEp.toFixed(2)}</Statistic.Value>
                        <Statistic.Label>Spell Hit Rating</Statistic.Label>
                    </Statistic>
                    <Statistic size='small'>
                        <Statistic.Value>{results.spellCritRatingEp.toFixed(2)}</Statistic.Value>
                        <Statistic.Label>Spell Crit Rating</Statistic.Label>
                    </Statistic>
                    <Statistic size='small'>
                        <Statistic.Value>{results.spellHasteRatingEp.toFixed(2)}</Statistic.Value>
                        <Statistic.Label>Spell Haste Rating</Statistic.Label>
                    </Statistic>
                    <Statistic size='small'>
                        <Statistic.Value>{results.intellectEp.toFixed(2)}</Statistic.Value>
                        <Statistic.Label>Intellect&nbsp;
                            <Popup
                                trigger={<Icon circular style={textTop} size='tiny' name='info' />}
                                content='Intellect EP is simply based on spell crit EP, since intellect gives a small amount of spell crit. This SIM assumes ~30 intellect grants 1% spell crit.'
                                size='small'
                            />
                        </Statistic.Label>
                    </Statistic>
                </EpsFlexbox>
                <Header dividing as='h2'>DPS Histogram</Header>
                <PlotlyChart data={data} layout={layout} />
                <Message size='tiny'>
                    Each EP is worth {results.dpsPerEp.toFixed(2)} DPS<br/>
                    The simulation took {results.timeTakenToSimulate} ms<br/>
                    This simulator assumes 1/1 Elemental Focus, 5/5 Convection, 5/5 Concussion talents are taken
                </Message>
            </Segment>
        );
    }

    componentDidUpdate(prevProps: Readonly<OutputViewProps>, prevState: Readonly<OutputViewState>, snapshot?: any) {
        if (this.state.simulationInput !== undefined) {
            const input = this.state.simulationInput;
            const carePackage = {
                component: this
            }
            setTimeout((carePackage) => {
                const results = simulate(input);
                carePackage.component.setState({
                    simulationInput: undefined,
                    simulationResults: results,
                })
            }, 0, carePackage);
        }
    }

    startNewSimulation(input: SimulationInput) {
        console.log("STARTING SIM");
        this.setState({
            ...this.state,
            simulationInput: input
        });
    }
}