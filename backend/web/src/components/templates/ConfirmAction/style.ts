import { makeStyles, Theme, createStyles } from "@material-ui/core";

export const useDialogStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      padding: 10,
      minWidth: 350,
    },
    buttons: {
        padding: 10,
    }
  }),
)