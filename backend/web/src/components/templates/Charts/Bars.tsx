import React from 'react'
import Chart from 'react-google-charts'
import { CircularProgress } from '@material-ui/core'

export const BarChart = (props: {min:number, max: number, data:any[][], title:string, colors: string[]}) => {

    return (
        <Chart className="ColumnChart chart"

            height={300}
            width={300}
            chartType="ColumnChart"
            loader={<CircularProgress color="primary" />}
            // data={[
            //     ['Percentage','test'], 
            //     ['value', value]
            // ]}
            data={props.data}
            options={{
                bar: {groupWidth: '50%'},
                title: props.title,
                colors: props.colors,
                animation: {
                    duration: 1000,
                    easing: 'out',
                    startup: true,
                },
                legend: {position:'none'},
                vAxis:{
                    minValue: props.min,
                    maxValue: props.max
                },
                
            }}
        />
    )
}