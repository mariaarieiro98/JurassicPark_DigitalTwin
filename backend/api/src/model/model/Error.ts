export enum Entity {
    general = 0,
    auth = 200
}

export interface Error {
    msg: string
    code: number
}

export interface EntityErrors {
    [key: string] : Error
}

export const GeneralErrors : EntityErrors = {
    general : {
        msg: 'Error Ocurred',
        code: Entity.general + 1
    }
}