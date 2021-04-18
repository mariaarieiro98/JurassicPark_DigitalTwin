import {createMuiTheme, makeStyles} from '@material-ui/core'

export const jurassicTheme = createMuiTheme({
    palette: {
        primary: {
            main: '#40591B',
            contrastText: '#ddd'
        },
        secondary: {
            main: '#3F3C31'
        },
        success: {
            main: '#55ff12'
        },
        text: {
            primary: '#666'
        },
        warning: {
            main: '#ffc107'
        },
        error: {
            main: '#dc3545'
        },
        grey: {
            "100": '#bbb',
            "200": '#666'
        }
    }
})

export const useGlobalStyles = makeStyles({
    hidden: {
        visibility: 'hidden'
    },
    hiddenHoverOpacity: {
        opacity: '0%',
        '&:hover': {
            opacity: '60%',
            visibility: 'visible'
        }
    },
    hoverOpacity: {
        '&:hover > *': {
            opacity: '60%',
            visibility: 'visible'
        },
        '&:hover': {
            opacity: '60%',
            visibility: 'visible'
        }
    }
})