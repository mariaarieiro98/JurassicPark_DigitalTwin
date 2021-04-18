import { makeStyles, Theme, createStyles } from "@material-ui/core";

export const useSmartComponentStyles = makeStyles((theme: Theme) =>
  
createStyles({
    
    onLineState : {
      width: 10,
      height: 10,
      borderRadius: '50%'
    },

    onLineStateOn : {
      backgroundColor: theme.palette.success.main
    },
    onLineStateOff : {
      backgroundColor: theme.palette.error.main
    },

    onLineStateComponent: {
      width: 20,
      height: 20
    },

    functionBlockError: {
      color: theme.palette.error.main
    },
    functionBlockGood: {
      color: theme.palette.success.main,
      animation: '$rotate 1.5s linear infinite'
    },
    "@keyframes rotate": {
      "from": {
        transform: "rotate(0)"
      },
      "to": {
        transform: "rotate(360deg)"
      }
    }
  }),
)