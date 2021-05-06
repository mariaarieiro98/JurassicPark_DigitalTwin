import React, { useState, useCallback } from 'react'
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { Box, Button } from '@material-ui/core'
import { ArrowDropUp,ArrowDropDown,Delete,Edit, SettingsApplications, Add, AddBox, AddBoxOutlined, Settings } from '@material-ui/icons'
import { useMountEffect } from '../../../utils/main'
import {useGlobalStyles} from '../../../styles/main'
import './JPTable.css'
import { ConfirmActionStateLabel, ConfirmActionProps, ConfirmAction } from '../ConfirmAction/ConfirmAction'

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      color: theme.palette.primary.main,
      fontWeight: 'bold',
      fontSize: 16,
    },
    body: {
      fontSize: 12,
    },
    
  }),
)(TableCell)

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.background.default,
      },
    },
  }),
)(TableRow)

const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
  tableHeader: {
    cursor:'pointer'
  }
})

export const JPTable = (props: {
      data: any[], updateData: ((data: any[]) => void)
      indexes : {label:string, key: string}[]
      tName: string
      extra?: {
        delete? :{
          action: (element:any) => Promise<any>
          labelKey: string,
          onSuccessDelete: (element: any) => void
        },
        edit?: {
          action: (element: any) => void
        } 
        details? :{
          action: (element: any) => void
        },
        add? :{
          action: (element: any) => void
        },
      }
      sortedkey? : string}) => {
    
    const classes = useStyles()
    const globalClasses = useGlobalStyles()
    const [orderBy, setOrderBy] : [string | '', Function] = useState('')
    const [previousOrderBy, setPreviousOrderBy] : [string | '', Function] = useState('')
    const [asc, setAsc] : [boolean, Function] = useState(false)
    const [deleting, setDeleting] : [string | undefined, Function] = useState(undefined)

    const sort = (criteria: string) => {

      if(!props.data.length)
        return
        
      // const criteria = props.indexes[criteriaIndex].key
      let newAsc = true
      
      const sorted : [] = [...props.data.sort((a:any, b:any) => {
        
        let elementA = a[criteria].key ?? a[criteria]
        let elementB = b[criteria].key ?? b[criteria]
        if(typeof a[criteria] === 'string') {
          elementA = (a[criteria].key ?? a[criteria] as string).toLocaleLowerCase()
          elementB = (b[criteria].key ?? b[criteria] as string).toLocaleLowerCase()
        }
        
        const greater = elementA >= elementB
        const equal = elementA === elementB

        if(criteria === orderBy)
          newAsc = !asc
          
        return equal ? 0 : newAsc ? greater ? 1 : -1 : greater ? -1 : 1
  
      })] as []
      
      setPreviousOrderBy(orderBy)
      setOrderBy(criteria)
      setAsc(newAsc)
      
      props.updateData(sorted)

    }

    useMountEffect(() => sort(props.sortedkey ? props.sortedkey : props.indexes[0].key))

    const setDeletingElement = useCallback((element: any) => () => setDeleting(element),[])
    const triggerEditElement = (element: any) => () => props.extra && props.extra.edit ? props.extra.edit.action(element) : {}
    const triggerDetailsElement = (element: any) => () => props.extra && props.extra.details ? props.extra.details.action(element) : {}
    const triggerAddElement = (element: any) => () => props.extra && props.extra.add ? props.extra.add.action(element) : {}

    const deleteLine = useCallback(() : Promise<string> => {

      return new Promise((res:Function, rej:Function) => {

        if(!(props.extra?.delete) || !deleting) {
          rej('')
          return
        }
        
        props.extra.delete.action(deleting)

          .then(_ => {
            res(`Correctly deleted ${props.tName} \n${deleting && props.extra?.delete ? deleting[props.extra?.delete?.labelKey] : ''}.`)
          })
          .catch(_ => {
            rej(`Error deleting ${props.tName} \n${deleting && props.extra?.delete ? deleting[props.extra?.delete?.labelKey] : ''}.`)
          })
      })

    },[deleting,props.extra,props.tName])

    const confirmActionStatesToRemove = {

      start: {
        label: `Delete ${props.tName} \n${deleting && props.extra?.delete ? deleting[props.extra?.delete?.labelKey] : ''}?`,
        positiveLabel: 'Yes',
        negativeLabel: 'No',
        state: ConfirmActionStateLabel.start
      },
      executing: {
        label: '',
        state: ConfirmActionStateLabel.executing,
      },
      success: {
        label: `Correctly deleted ${props.tName} \n${deleting && props.extra?.delete ? deleting[props.extra?.delete?.labelKey] : ''}.`,
        state: ConfirmActionStateLabel.success,
        positiveLabel: 'Ok'
      },
      error: {
        label: `Error deleting ${props.tName} \n${deleting && props.extra?.delete ? deleting[props.extra?.delete?.labelKey] : ''}.`,
        state: ConfirmActionStateLabel.error,
        positiveLabel: 'Ok'
      },
    }

    const onCancel = () => setDeleting(undefined)
    const onError = () => setDeleting(undefined)
    const onSuccess = () => {
      props.updateData(props.data.filter((cElement: any) => cElement !== deleting))
      if(deleting)
        props.extra?.delete?.onSuccessDelete(deleting)
    }
  
    const confirmActionPropsDeleting : ConfirmActionProps = {
      
      title: `Deleting ${props.tName}`,
      states: confirmActionStatesToRemove,
      currentState: confirmActionStatesToRemove.start,
      onCancel: onCancel,
      onError: onError,
      onSuccess: onSuccess,
      action:deleteLine,
    
    }

    return (
      <>
      {deleting ? <ConfirmAction {...confirmActionPropsDeleting} /> : null }
      <TableContainer component={Paper}>
          <Table className={classes.table} size="small" aria-label="customized table">
              <TableHead>
                  <TableRow>
                      {props.indexes.map((element: {key: string, label: string}, index: number) => 
                          <StyledTableCell className={classes.tableHeader} onClick={() => sort(element.key)} key={index}>
                              <Box className={globalClasses.hoverOpacity} display="flex" flexDirection="row" alignItems="center">
                                  {element.label}
                                  {element.key === orderBy ? asc ? <ArrowDropUp className={previousOrderBy === orderBy ? "arrow-up" : ""}/> : <ArrowDropDown className={element.key === orderBy ? "arrow-down" : ""}/> : <ArrowDropUp className={`${globalClasses.hiddenHoverOpacity}`} />}
                              </Box> 
                          </StyledTableCell>)
                      }
                      {props.extra 
                          ? props.extra.details ? <StyledTableCell></StyledTableCell> : null
                          : null
                      }
                      {props.extra 
                          ? props.extra.add ? <StyledTableCell></StyledTableCell> : null
                          : null
                      }
                      {props.extra 
                          ? props.extra.edit ? <StyledTableCell></StyledTableCell> : null
                          : null
                      }
                      {props.extra 
                          ? props.extra.delete ? <StyledTableCell></StyledTableCell> : null
                          : null
                      }
                  </TableRow>
              </TableHead>
              {!!props.data.length ?
                <TableBody>
                {props.data.map((row:any, elIndex:number) => (
                    <StyledTableRow key={elIndex}>
                        {props.indexes.map((element: {key: string, label: string}, valIndex: number) => <StyledTableCell key={valIndex}>{row[element.key]?.data ?? row[element.key] }</StyledTableCell>)}
                        {props.extra 
                          
                          ? props.extra.details
                            ? <StyledTableCell><Button disabled={row.detailsDisabled ?? false} onClick={triggerDetailsElement(row)} style={{minWidth:0}} variant="text" size="small"><Settings fontSize="small"/></Button></StyledTableCell> 
                            : null
                          : null
                        }
                           {props.extra 
                          
                          ? props.extra.add
                            ? <StyledTableCell><Button disabled={row.addDisabled ?? false} onClick={triggerAddElement(row)} style={{minWidth:0}} variant="text" size="small"><AddBoxOutlined fontSize="small"/></Button></StyledTableCell> 
                            : null
                          : null
                        }
                        {props.extra 
                          
                          ? props.extra.edit 
                            ? <StyledTableCell><Button disabled={row.editDisabled ?? false} onClick={triggerEditElement(row)} style={{minWidth:0}} variant="text" size="small"><Edit fontSize="small"/></Button></StyledTableCell> 
                            : null
                          : null
                        }
                        {props.extra 
                          
                          ? props.extra.delete 
                            ? <StyledTableCell><Button disabled={row.deleteDisabled ?? false} onClick={setDeletingElement(row)} style={{minWidth:0}} variant="text" size="small"><Delete fontSize="small"/></Button></StyledTableCell> 
                            : null
                          : null
                        }
                    </StyledTableRow>
                ))}
                </TableBody>
                : null
              }
          </Table>
      </TableContainer>
      </>
    )
}