import { makeStyles, Theme, createStyles } from "@material-ui/core";

export const useFunctionBlockStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      borderWidth:0.3,
      borderColor: theme.palette.primary.main,
      borderStyle: 'solid',
      padding: 10,
      marginBottom: 2
    },
    varEvButton: {
      width: "25px",
      height: "auto",
      // borderRadius: "50%",
      // padding: '5px !important',
      minWidth: '0 !important',
      backgroundColor: theme.palette.primary.main,
      color: 'white'
    },
    icon: {
      width:25,
      height:25,
      minWidth: '0 !important',
    },
    tfFile: {
      width: '100%'
    },
    dependenciesBox: {
      padding: 10,
      marginTop: 10
    },
    dependency: {
      margin: '0 5px 5px 5px'
    },
    categoryError: {
      '& > * > *::before': {
        borderBottom: `2px solid ${theme.palette.error.main}`
      },
      '& > * > label': {
        color: theme.palette.error.main
      },
    }
  }),
)