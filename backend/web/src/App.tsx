import React from 'react'
import './App.css'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { FunctionBlockList } from './components/FunctionBlocks/List/List'
import { ThemeProvider } from '@material-ui/core'
import { jurassicTheme } from './styles/main'
import { NewFunctionBlock } from './components/FunctionBlocks/FunctionBlock/NewFunctionBlock'
import { EditFunctionBlock } from './components/FunctionBlocks/FunctionBlock/EditFunctionBlock'
import { SmartComponentDetail } from './components/SmartComponents/SmartComponent/SmartComponent'
import { FunctionBlockCategoryList } from './components/FunctionBlockCategories/List/List'
import { functionBlockReducer, marketplaceOnlineStateReducer, functionBlockCategoryReducer, functionalityReducer, digitalTwinReducer, associatedSmartComponentReducer, smartComponentReducer, monitoredVariableReducer, monitoredEventReducer, monitoredVariableInstanceReducer, variableToMonitorReducer } from './redux/reducers'
import { Store, useCreateStore, useStore } from './components/templates/Store/Store'
import { SmartComponentList } from './components/SmartComponents/List/List'
import { useMountEffect } from './utils/main'
import { MarketPlaceOnlineStateActions } from './redux/actions'
import { SocketConnection } from './services/socket/socket'
import { DigitalTwinMonitoring } from './components/DigitalTwin/DigitalTwinMonitoring'
import { NewDigitalTwin } from './components/DigitalTwin/NewDigitalTwin'
import { FunctionalityDetails } from './components/DigitalTwin/FunctionalityDetails'

export const routes = {
  home: '/',
  functionBlockList: '/function-block',
  editFunctionBlock: '/function-block/:id',
  newFunctionBlock: '/new-function-block',
  newDigitalTwin: '/new-digital-twin',
  smartComponentList: '/smart-component',
  smartComponentDetail: '/smart-component/:id',
  functionBlockCategories: '/function-block-category',
  digitalTwinMonitoring: '/digital-twin-monitoring',
  editFunctionality: '/functionality/:id',
  functionalityDetails: '/functionality-details/:id',
}

export enum AVAILABLE_STORES {
  functionBlocks = 'functionBlocks',
  marketplaceOnlineState = 'marketplaceOnlineState',
  functionBlockCategories = 'functionBlockCategories',
  functionalities = 'functionalities',
  digitalTwins = 'digitalTwins',
  smartComponents = 'smartComponents',
  associatedSmartComponents = 'associatedSmartComponents',
  monitoredVariables = 'monitoredVariables',
  monitoredEvents = 'monitoredEvents',
  monitoredVariableInstances = 'monitoredVariableInstances',
  variablesToMonitor = 'variablesToMonitor'
}

const App = () : React.ReactElement => {

  const store = {
    [AVAILABLE_STORES.functionBlocks]: useCreateStore({reducer:functionBlockReducer,initialState:[]}),
    [AVAILABLE_STORES.marketplaceOnlineState] : useCreateStore({reducer: marketplaceOnlineStateReducer, initialState: false}),
    [AVAILABLE_STORES.functionBlockCategories] : useCreateStore({reducer: functionBlockCategoryReducer, initialState: []}),
    [AVAILABLE_STORES.functionalities] : useCreateStore({reducer: functionalityReducer, initialState: []}),
    [AVAILABLE_STORES.digitalTwins] : useCreateStore({reducer: digitalTwinReducer, initialState: []}),
    [AVAILABLE_STORES.smartComponents] : useCreateStore({reducer: smartComponentReducer, initialState: []}),
    [AVAILABLE_STORES.associatedSmartComponents] : useCreateStore({reducer: associatedSmartComponentReducer, initialState: []}),
    [AVAILABLE_STORES.monitoredVariables] : useCreateStore({reducer: monitoredVariableReducer, initialState: []}),
    [AVAILABLE_STORES.monitoredEvents] : useCreateStore({reducer: monitoredEventReducer, initialState: []}),
    [AVAILABLE_STORES.monitoredVariableInstances] : useCreateStore({reducer: monitoredVariableInstanceReducer, initialState: []}),
    [AVAILABLE_STORES.variablesToMonitor] : useCreateStore({reducer: variableToMonitorReducer, initialState: []})
  }

  return (
    <Router>
      <ThemeProvider theme={jurassicTheme}>
          <Switch>
              <Store store={store}>
                <Main>
                  <Route exact path={routes.home} render={props => <Redirect to={routes.functionBlockList}/>} />
                  <Route exact path={routes.functionBlockList} component={FunctionBlockList} />
                  <Route exact path={routes.newFunctionBlock} component={NewFunctionBlock} />
                  <Route exact path={routes.editFunctionBlock} component={EditFunctionBlock} />
                  <Route exact path={routes.smartComponentList} component={SmartComponentList} />
                  <Route exact path={routes.smartComponentDetail} component={SmartComponentDetail} />
                  <Route exact path={routes.functionBlockCategories} component={FunctionBlockCategoryList} />
                  <Route exact path={routes.digitalTwinMonitoring} component={DigitalTwinMonitoring}/>
                  <Route exact path={routes.functionalityDetails} component={FunctionalityDetails}/>
                  <Route exact path={routes.newDigitalTwin} component={NewDigitalTwin}/>
                </Main>
              </Store>
          </Switch>
      </ThemeProvider>
    </Router>
  )
}

const Main = (props: {children:JSX.Element[]}) => {

  const {dispatchAction:setMarketplaceState} = useStore('marketplaceOnlineState')
  let socket : SocketConnection = new SocketConnection('')
  
  const onConnect = () => {

    setMarketplaceState(MarketPlaceOnlineStateActions.updateMarketplaceOnlineState(true))
    
  }

  const onDisconnect = () => {

    setMarketplaceState(MarketPlaceOnlineStateActions.updateMarketplaceOnlineState(false))

  } 

  useMountEffect(() => socket.connect(onConnect,onDisconnect), () => socket?.disconnect())

  return <>{props.children}</>

}

export default App