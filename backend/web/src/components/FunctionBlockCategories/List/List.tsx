import React, { useState } from 'react'
import { Navigator } from '../../templates/Navigator/Navigator'
import { ConfirmAction, ConfirmActionState, ConfirmActionStateLabel, ConfirmActionProps } from '../../templates/ConfirmAction/ConfirmAction'
import { LazyComponent } from '../../templates/LazyComponent/LazyComponent'
import { JPTable } from '../../templates/Table/JPTable'
import { FBCategory, FunctionBlock } from '../../../model'
import { useMountEffect } from '../../../utils/main'
import { getOrDownloadFunctionBlockCategories } from '../../../utils/functionBlock'
import { useStore } from '../../templates/Store/Store'
import { FunctionBlockCategoriesActions } from '../../../redux/actions'
import { RequestResponseState } from '../../../services/api/api'
import { TextField, Grid, Button, Box, Dialog, DialogTitle, CircularProgress } from '@material-ui/core'
import { createFunctionBlockCategory, updateFunctionBlockCategory } from '../../../services/api/function-block'
import { deleteFunctionBlockCategory} from '../../../services/api/function-block'
import { useDialogStyles } from './style'
import { CheckCircle, Error } from '@material-ui/icons'
import { functionBlockCategoryReducer } from '../../../redux/reducers'

const NEW_CATEGORY_RE = /[a-zA-Z0-9]{3,}/

let categoryId = -1

const EditFBCategoryDialog = (props: {category: FBCategory, onGood: (newCategory: FBCategory) => void, onError: () => void, onCancel: () => void}) => {

    const [newCategoryName, setNewCategoryName] : [string,Function] = useState(props.category.fbcName)

    const classes = useDialogStyles()

    const [sending, setSending] : [boolean, Function] = useState(false)

    const [result, setResult] : [{done: boolean, good?: boolean, message?: string},Function] = useState({done:false})

    const action = () => {

        if(props.category.fbcId) {

            if(!result.done) {

                setSending(true)
    
                updateFunctionBlockCategory(props.category.fbcId, newCategoryName)

                    .then((response: RequestResponseState) => {
                        setResult({done:true, good: true, message: response.msg})
                    })

                    .catch((error: RequestResponseState) => {
                        setResult({done: true, good: false, message: error.msg})
                    })

                    .finally(() => setSending(false))

            }

            else {

                if(result.good)
                    props.onGood({...props.category, fbcName: newCategoryName})
                
                else
                    props.onError()

            }

        }

    }

    return (
        <Dialog open={true}>
            <DialogTitle>Edit Category</DialogTitle>
            <Box className={classes.box}>
                {
                    !result.done 
                        ?
                            <TextField 
                                disabled={sending}
                                value={newCategoryName}
                                onChange={(event) => setNewCategoryName(event.target.value)}
                            />
                        :    <Grid container justify="center">
                                <Grid item>
                                    {
                                        result.good 
                                            ?   <CheckCircle color="primary" />
                                            :   <Error color="error" />
                                    }
                                </Grid>
                                <Grid item>
                                    <Box className={result.good ? classes.good : classes.error} textAlign="center">{result.message}</Box>
                                </Grid>
                            </Grid> 
                }
            </Box>
            <Grid className={classes.buttons} container direction="row" justify="space-between">
                <Grid item>
                    {sending 
                        ? <CircularProgress color="primary" />
                        : <Button onClick={action}>Ok</Button>
                    }
                </Grid>
                <Grid item>
                    <Button disabled={sending} onClick={props.onCancel}>Cancel</Button>
                </Grid>
            </Grid>
        </Dialog>
    )

}

export const FunctionBlockCategoryList = () => {

    const [fetching,setFetching] = useState(true)
    const [error,setError] = useState('')
    const [newCategory,setNewCategory] = useState('')

    const [confirmAddCategory,setConfirmAddCategory] : [boolean, Function] = useState(false)

    const [validNewCategory, setValidNewCategory] : [boolean,Function] = useState(true)

    const errorFetchngCategoriesState : ConfirmActionState = {
        label: error,
        state: ConfirmActionStateLabel.error,
        positiveLabel: 'Ok'
    }

    const onCancel = () => setError('')

    const {data: functionBlockCategories, dispatchAction:dispatchFunctionBlockCategoriesActions} = useStore('functionBlockCategories')

    const updateFunctionBlockCategories = (categories: FBCategory[]) => dispatchFunctionBlockCategoriesActions(FunctionBlockCategoriesActions.updateFunctionBlockCategories(categories))
    const addFunctionBlockCategory = () => dispatchFunctionBlockCategoriesActions(FunctionBlockCategoriesActions.addFunctionBlockCategory({fbcId: categoryId, fbcUserId:1, fbcName: newCategory}))

    const [editingCategory, setEditingCategory] : [FBCategory | null,Function] = useState(null)


    const indexes = [
        {label: 'Name', key: 'fbcName'},
        {label: 'Function Block List', key: 'fbList'}
    ]

    useMountEffect(() => {

        setTimeout(() => {
    
          setFetching(true)
          getOrDownloadFunctionBlockCategories(functionBlockCategories)
              .then((result: FBCategory[]) => updateFunctionBlockCategories(result))
              .catch((e:RequestResponseState) => setError(e.msg))
              .finally(() => setFetching(false))
    
            
        }, 0)
    
    })

    const isCategoryValid = (category:string) => NEW_CATEGORY_RE.test(category)

    const validateAndCreate = () => {

        const validCategory = isCategoryValid(newCategory)

        if(!validCategory)
            setValidNewCategory(false)
        else
            setConfirmAddCategory(true)
    
    }

    const addNewCategoryAction = () : Promise<string> => {

        return new Promise<string>((res:Function, rej:Function)  => { 
            
            createFunctionBlockCategory(newCategory.trim())

                .then((result: RequestResponseState) => {
                    categoryId = result.extra.lastInsertedId
                    res('Category created')
                })

                .catch((e:RequestResponseState) => rej(e.msg))

        })

    }

    const confirmCategoryCreationActionStates = {
        start: {
            label: `Confirm creation of new category: ${newCategory} ?`,
            positiveLabel: 'Ok',
            negativeLabel: 'Cancel',
            state: ConfirmActionStateLabel.start
        },
        executing: {
          label: '',
          state: ConfirmActionStateLabel.executing,
        },
        success: {
          label: 'Category Created',
          state: ConfirmActionStateLabel.success,
          positiveLabel: 'Ok'
        },
        error: {
          label: 'Error Creating Category',
          state: ConfirmActionStateLabel.error,
          positiveLabel: 'Ok'
        },
      }
    
    const confirmActionProps : ConfirmActionProps = {

        title: 'Add Category',
        states: confirmCategoryCreationActionStates,
        currentState: confirmCategoryCreationActionStates.start,
        onCancel: () => setConfirmAddCategory(false),
        onError: () => setConfirmAddCategory(false),
        onSuccess: () => {
            addFunctionBlockCategory()
            setNewCategory('')
        },
        action: addNewCategoryAction,
    }

    const getData = () => functionBlockCategories.map((category: FBCategory) => {

        return {
            ...category,
            fbList: {
                key: category.functionBlocks?.length ?? 0,
                data:  <Grid container direction="row" spacing={2} wrap="wrap"> {category.functionBlocks?.map((fb: string, index:number) => (
                    <Grid key={index} item><Box fontStyle="italic"> {fb} ; </Box></Grid>
                ))} </Grid>
            },
            deleteDisabled: !!category.functionBlocks?.length ?? false
        }

    })

    const deleteFunctionBlockCategoryAction = (category: FBCategory) : Promise<any> => {

        return new Promise(async(res:Function,rej:Function) => {

            if(!category.fbcId) {
                rej('Error')
                return
            }

            try {
                const response : RequestResponseState = await deleteFunctionBlockCategory(category.fbcId)
                res(response)
              }
    
            catch(err) {
                rej(err)
            }
        })

    }

    const cancelEditing = () => setEditingCategory(null)
    const showEditing = (cat: FBCategory) => setEditingCategory(cat)

    const onGoodEditing = (editingCat: FBCategory) => {

        const newCats = functionBlockCategories.map((cat: FBCategory) => {

            if(cat.fbcId === editingCat.fbcId)
                return {...cat, fbcName: editingCat.fbcName}
            return cat

        })
        
        cancelEditing()
        dispatchFunctionBlockCategoriesActions(FunctionBlockCategoriesActions.updateFunctionBlockCategories(newCats))

    }

    return (
        <Navigator title="Function Block Categories">
        <> 
            {error !== ''
                ? <ConfirmAction title='Fetching Function Blocks' currentState={errorFetchngCategoriesState} states={{error: errorFetchngCategoriesState}} onCancel={onCancel}/>
                : null 
            }
            <LazyComponent loaded={!fetching}>
                <>
                    {confirmAddCategory 
                        ? <ConfirmAction {...confirmActionProps} /> 
                        : editingCategory 
                            ?  <EditFBCategoryDialog 
                                onGood={onGoodEditing}
                                category={editingCategory}
                                onError={cancelEditing}
                                onCancel={cancelEditing} />
                            : null
                    }
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <JPTable
                                sortedkey="fbcName"
                                data={getData()} 
                                updateData={updateFunctionBlockCategories} 
                                indexes={indexes}
                                tName='Function Block Category'
                                extra={{
                                    delete: {
                                        action: deleteFunctionBlockCategoryAction,
                                        labelKey: 'fbcName',
                                        onSuccessDelete: () => {}
                                    },
                                    edit: {
                                        action: showEditing
                                    }
                                }} 
                            />
                        </Grid>
                        <Grid item>
                            <Grid container justify="flex-end" spacing={1}>
                                <Grid item xs={4}>
                                    <TextField
                                        helperText={!validNewCategory ? NEW_CATEGORY_RE.toString() : ''}
                                        error={!validNewCategory}
                                        required
                                        onChange={(event) => {
                                            setNewCategory(event.target.value)
                                            if(!validNewCategory)
                                                setValidNewCategory(isCategoryValid(event.target.value.trim()))
                                        }}
                                        fullWidth
                                        value={newCategory}
                                    />
                                </Grid>
                                <Grid item>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        onClick={validateAndCreate}
                                    >
                                        Add Category
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            </LazyComponent>
        </>
        </Navigator>
    )

}