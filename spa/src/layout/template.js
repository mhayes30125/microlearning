import React, { useEffect,useState } from 'react';
import axios from 'axios'
import MenuIcon from '@material-ui/icons/Menu';
import * as api from '../api/notes-api'
import { 
    Grid,
    AppBar,
    Toolbar,
    IconButton,
    MenuItem,
    Typography,
    Button,
    Container,
    Card,
    CardActions,
    CardContent
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));

const Template = ({auth}) =>
{
    const classes = useStyles();
    const [notes, setNotes] = useState([]);
    const [finishedWait, setFinishedWait] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(async () => {        

        if(isAuthenticated === false)
        {
            return;
        }

        try{
            const currentNotes = await api.getNotes(auth.getIdToken());
            setNotes(currentNotes);
            setFinishedWait(true);
        }
        catch(error)
        {
            console.log(error);
        }
        
      },[isAuthenticated]);

    if(auth.isAuthenticated() != isAuthenticated)
    {
        setIsAuthenticated(!isAuthenticated);
    }

    return(
    <Grid container direction="column">
        <Grid item>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                    Microlearning
                    </Typography>
                    <Button color="inherit" onClick={auth.login}>Login</Button>
                </Toolbar>
            </AppBar>
        </Grid>
        <Grid item>
            {
                finishedWait &&
                    <Container>
                    {
                        notes.map((note, pos)=>
                        {
                            return(
                            <Card>
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary" component="p">
                                        note.note
                                    </Typography>
                                </CardContent>
                            </Card>);
                        })
                    }
                    </Container>
            }
        </Grid>
    </Grid>
    );
}

export default Template;