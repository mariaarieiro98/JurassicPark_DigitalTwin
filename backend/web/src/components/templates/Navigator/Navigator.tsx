import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import CssBaseline from '@material-ui/core/CssBaseline'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import CategoryIcon from '@material-ui/icons/Category'
import Add from '@material-ui/icons/Add'
import Memory from '@material-ui/icons/Memory'
import InsertChartIcon from '@material-ui/icons/InsertChart';

import {ReactComponent as FunctionIcon} from '../../../icons/Function.svg'
import { Link } from 'react-router-dom'
import { routes } from '../../../App'
import { useStore } from '../Store/Store'

import {Router} from '@material-ui/icons'
import { Grid } from '@material-ui/core'

export interface Component {
    title: string
    children: JSX.Element 
}

const drawerWidth = 240

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    toolbar: theme.mixins.toolbar,
    icons: {
        width: 24,
        height: 24
    },
    links: {
        textDecoration: 'none',
        color: 'inherit'
    },
    marketplaceOff: {
        color: theme.palette.error.main
    },
    marketplaceOn: {
        color: theme.palette.success.main
    },
  }),
)

const Menu = () : JSX.Element => {

    const classes = useStyles()

    const options = [
        {
            text: 'Function Blocks',
            path: '/function-block',
            icon: <FunctionIcon className={classes.icons}/>
        },
        {
            text: 'Function Blocks Categories',
            path: routes.functionBlockCategories,
            icon: <CategoryIcon className={classes.icons} />
        },
        {
            text: 'Smart Components',
            path: routes.smartComponentList,
            icon: <Memory className={classes.icons} />
        },
        {
            text: 'Digital Twin Platform',
            path: routes.digitalTwinMonitoring,
            icon: <InsertChartIcon className={classes.icons} />
        },
    ]

    const secundaryOptions = [
        {
            text: 'New Function Block',
            path: '/new-function-block',
            icon: <Add className={classes.icons} />
        },
        {
            text: 'New Digital Twin',
            path: '/new-digital-twin',
            icon: <Add className={classes.icons} />
        },
    ]

    const generateList = (options: any[]) : JSX.Element => {
        return (
            <List>
            {options.map((option) => (
                <ListItem key={option.text} button component={Link} to={option.path} >
                    <ListItemIcon>{option.icon}</ListItemIcon>
                    <ListItemText primary={option.text}/> 
                </ListItem>
            ))}
            </List>
        )
    }

    return (

        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
                paper: classes.drawerPaper,
            }}
        >
            <div className={classes.toolbar} />
            {generateList(options)}
            <Divider />
            {generateList(secundaryOptions)}
        </Drawer>

    )

}

export const Navigator = (content:Component) : JSX.Element => {
  
    const classes = useStyles()

    const {data: marketplaceOnlineState} = useStore('marketplaceOnlineState')

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <Grid container justify="space-between">
                        <Grid item>
                            <Typography variant="h6" noWrap>
                                {content.title}
                            </Typography>
                        </Grid>
                        <Grid item xs={8} container alignItems="center" justify="flex-end" direction="row" spacing={1}>
                            <Grid item>
                                <Typography variant="h5" noWrap>
                                    Jurassic Park Marketplace
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Router fontSize="large" className={marketplaceOnlineState ? classes.marketplaceOn : classes.marketplaceOff} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <Menu />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {content.children}
            </main>
        </div>
    )
}
