import React, { useEffect,useState } from 'react';
import axios from 'axios'
import {
    Menu as MenuIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    AddPhotoAlternate as AddPhotoAlternateIcon
} from '@material-ui/icons';

import { createNote, deleteNote, getNotes, patchNote,getUploadUrl, uploadFile } from '../api/notes-api'

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
    CardContent,
    TextField,
    Checkbox,
    FormControlLabel,
    Paper
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

    if(auth.isAuthenticated() != isAuthenticated)
    {
        setIsAuthenticated(!isAuthenticated);
    }

    useEffect(() => {        

        async function CallGetNotes()
        {
            if(isAuthenticated === false)
            {
                return;
            }
    
            try{
                const currentNotes = await getNotes(auth.getIdToken());
                setNotes(notes => currentNotes.map(item =>
                {
                    const wrappedNote ={
                        ...item,
                        editDisable: true
                    };
                    return wrappedNote;
                    
                }));
                setFinishedWait(true);
            }
            catch(error)
            {
                console.log(error);
            }
        }

        CallGetNotes();
        
      },[isAuthenticated]);    

    const onNoteCreate = async (event) => {
        try {

          const newNote = await createNote(auth.getIdToken(), {
            note: 'newNote',
            category: 'newCategory',
            question: 'newQuestion'
          })

          const wrappedNote ={
            ...newNote,
            editDisable: true
        };

          setNotes(
            notes => [...notes, wrappedNote]
          )
        } catch(error) {
          console.log(error);
          alert('Note creation failed')
        }
      }

      const onNoteDeleteButton = async (note) => {
        try {
            if(window.confirm(`Are you sure you want to delete this note? ${note.noteId}`) === true)
            {
                await deleteNote(auth.getIdToken(), note.noteId);

                setNotes(notes => notes.filter(f=>f.noteId != note.noteId));
            };
        } catch(error) {
          console.log(error);
          alert('Note deletion failed')
        }
      }

      const onUpdateNote = async (event, note) =>
      {
        setNotes(notes => notes.map((item)=>
            {
                if(item.noteId === note.noteId)
                {
                    item.note = event.target.value;
                }
                return item;
            }));
      }

      const onUpdateCategory = async (event, note) =>
      {
        setNotes(notes => notes.map((item)=>
            {
                if(item.noteId === note.noteId)
                {
                    item.category = event.target.value;
                }
                return item;
            }));
      }

      const onUpdateQuestion = async (event, note) =>
      {
        setNotes(notes => notes.map((item)=>
            {
                if(item.noteId === note.noteId)
                {
                    item.question = event.target.value;
                }
                return item;
            }));
      }

      const onUpdateAnswer = async (event, note) =>
      {
        setNotes(notes => notes.map((item)=>
            {
                if(item.noteId === note.noteId)
                {
                    item.answer = event.target.value;
                }
                return item;
            }));
      }

      const onUpdateDone = async (event, note) =>
      {
        setNotes(notes => notes.map((item)=>
            {
                if(item.noteId === note.noteId)
                {
                    item.done = event.target.checked;
                }
                return item;
            }));
      }

      const onNoteEditButton = (note) =>
      {
        setNotes(notes => notes.map((item)=>
            {
                if(item.noteId === note.noteId)
                {
                    item.editDisable = !item.editDisable;
                }
                return item;
            }));
      }

      const onNoteSaveButton = async (note) =>
      {
        try {

            await patchNote(auth.getIdToken(), note.noteId, note);

            setNotes(notes => notes.filter((item)=>
            {
                if(item.noteId === note.noteId && note.done === true)
                {
                    return false;
                }
                return true;
            }));

            onNoteEditButton(note);
            alert("Item saved");
        } catch(error) {
          console.log(error);
          alert('Note patch failed')
        }
      }

      const onNoteSaveAltButton = async (event, note) =>
      {
        try {
      
            var file = event.target.files[0];
            if(!file)
            {
                return;
            }

            //this.setUploadState(UploadState.FetchingPresignedUrl)
            const presignedUrl = await getUploadUrl(auth.getIdToken(), note.noteId)
      
            //this.setUploadState(UploadState.UploadingFile)
            await uploadFile(presignedUrl.uploadUrl, file)
            
            note.attachmentUrl = presignedUrl.retrievalUrl;
            await patchNote(auth.getIdToken(), note.noteId,note);

            setNotes(notes => notes.map((item)=>
            {
                if(item.noteId === note.noteId)
                {
                    item.attachmentUrl = presignedUrl.retrievalUrl;
                }
                return item;
            }));
      
            alert('File was uploaded!')
          } catch (e) {
            alert('Could not upload a file: ' + e.message)
          } finally {
          }
      }

    return(
    <Grid container direction="column" spacing={2}>
        <Grid item>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                    Microlearning
                    </Typography>
                    {
                        isAuthenticated && <div>
                            <Button color="inherit" onClick={onNoteCreate}>Add</Button>
                            <Button color="inherit" onClick={auth.logout}>Logout</Button>
                        </div>
                    }
                    {
                        !isAuthenticated && <Button color="inherit" onClick={auth.login}>Login</Button>
                    }
                    
                </Toolbar>
            </AppBar>
        </Grid>
        <Grid item>
            {
                finishedWait &&
                    <Container>
                        <Grid container spacing={2}>
                            {
                            notes.map((note)=>
                            {
                                return(
                                    <Grid item>
                                        <Card>
                                            <CardContent>
                                                <form>
                                                    <Grid container direction="column">
                                                        <Grid item>
                                                            <TextField 
                                                            id="standard-basic" 
                                                            label="Category" 
                                                            value={note.category} 
                                                            onChange={(event)=>onUpdateCategory(event,note)}
                                                            InputProps={{
                                                                readOnly: note.editDisable,
                                                              }}/>
                                                        </Grid>
                                                        <Grid item>
                                                            <TextField 
                                                            id="standard-basic" 
                                                            label="Note" 
                                                            value={note.note}
                                                            onChange={(event)=>onUpdateNote(event,note)}
                                                            InputProps={{
                                                                readOnly: note.editDisable,
                                                              }}/>
                                                        </Grid>
                                                        <Grid item>
                                                            <TextField 
                                                            id="standard-basic" 
                                                            label="Question" 
                                                            onChange={(event)=>onUpdateQuestion(event,note)}
                                                            value={note.question}
                                                            InputProps={{
                                                                readOnly: note.editDisable,
                                                              }}/>
                                                        </Grid>
                                                        <Grid item>
                                                            <TextField 
                                                            id="standard-basic" 
                                                            label="Answer" 
                                                            onChange={(event)=>onUpdateAnswer(event,note)}
                                                            value={note.answer}
                                                            InputProps={{
                                                                readOnly: note.editDisable,
                                                              }}/>
                                                        </Grid>
                                                        <Grid item>
                                                            <FormControlLabel
                                                                control={
                                                                <Checkbox
                                                                    checked={note.done}
                                                                    onClick={(event)=>onUpdateDone(event,note)}
                                                                    name="checkedB"
                                                                    color="primary"
                                                                    disabled={note.editDisable}
                                                                />
                                                                }
                                                                label="Done"
                                                            />
                                                        </Grid>
                                                        <Grid item>
                                                            <Paper variant="outlined">
                                                                <img src={note.attachmentUrl} size="small" wrapped />
                                                            </Paper>
                                                        </Grid>
                                                    </Grid>
                                                </form>
                                            </CardContent>
                                            <CardActions>
                                                {
                                                    note.editDisable && (
                                                        <IconButton color="primary" aria-label="edit note" onClick={()=> onNoteEditButton(note)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    )
                                                }
                                                {
                                                    !note.editDisable && (
                                                        <IconButton color="primary" aria-label="save note" onClick={()=> onNoteSaveButton(note)}>
                                                            <SaveIcon />
                                                        </IconButton>
                                                    )
                                                }
                                            
                                            <IconButton color="primary" aria-label="delete note" onClick={()=> onNoteDeleteButton(note)}>
                                                <DeleteIcon />
                                            </IconButton>
                                            <input 
                                            accept="image/*" 
                                            id={`icon-button-file${note.noteId}`}
                                            type="file" 
                                            hidden 
                                            onChange={(event)=> onNoteSaveAltButton(event,note)}
                                            />
                                                <label htmlFor={`icon-button-file${note.noteId}`}>
                                                    <IconButton color="primary" component="span">
                                                        <AddPhotoAlternateIcon />
                                                    </IconButton>
                                            </label>
                                            
                                            </CardActions>
                                        </Card>
                                </Grid>);
                            })
                            }
                            
                        </Grid>
                    </Container>
            }
        </Grid>
    </Grid>
    );
}

export default Template;