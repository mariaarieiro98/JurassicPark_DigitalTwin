import { makeStyles, Theme, createStyles } from "@material-ui/core";

export const useChartStyles = makeStyles((theme: Theme) =>
  
    createStyles({
        
        gauge: {
            '& circle:nth-child(1)': {
                'stroke-width': 2,
                stroke:  theme.palette.primary.main,
                fill: theme.palette.grey[100]
            },
            '& circle:nth-child(3)': {
                fill: theme.palette.primary.main,
                stroke: theme.palette.primary.main,
                'stroke-width': 1
            },
            '& path': {
                stroke: theme.palette.primary.main
            },
            '& g g path': {
                stroke: theme.palette.primary.main,
                fill: theme.palette.grey[200]
            },
            '& path:nth-child(3)': {
                fill: theme.palette.warning.main
            },
            '& path:nth-child(4)': {
                fill: theme.palette.error.main
            },
            '& text': {
                fill: theme.palette.text.primary,
                'font-size': 16
            },
            '& text:nth-child(1)': {
                fill: theme.palette.text.primary
            }
        }
    
    }),

)