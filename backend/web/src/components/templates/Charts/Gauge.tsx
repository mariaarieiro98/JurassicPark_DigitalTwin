import React from 'react'
import Chart from 'react-google-charts'
import { CircularProgress } from '@material-ui/core'
import { useChartStyles } from './style'

export const GaugeChart = (props: {label:string, value: number, min:number, max:number, warnMin:number, warnMax:number, dangerMin:number, dangerMax:number, ticks:number}) => {

    const classes = useChartStyles()

    return (
        <Chart className={classes.gauge}

            width={300}
            height={300}
            chartType="Gauge"
            loader={<CircularProgress color="primary" />}
            data={[
                ['Label', 'Value'],
                [props.label, props.value],
            ]}
            options={{
                redFrom: props.dangerMin,
                redTo: props.dangerMax,
                yellowFrom: props.warnMin,
                yellowTo: props.warnMax,
                minorTicks: props.ticks,
                min: props.min,
                max: props.max,
                animation: {
                    duration: 1000,
                    easing: 'out',
                    startup: true,
                },
            }}
        />
    )
}