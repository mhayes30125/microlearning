import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, getNote, patchNote } from '../api/notes-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditNoteProps {
  match: {
    params: {
      noteId: string
    }
  }
  auth: Auth
}

interface EditNoteState {
  file: any
  uploadState: UploadState
}

export class EditNote extends React.PureComponent<
  EditNoteProps,
  EditNoteState
> {
  state: EditNoteState = {
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const presignedUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.noteId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(presignedUrl.uploadUrl, this.state.file)
      
      const currentNote = await getNote(this.props.auth.getIdToken(), this.props.match.params.noteId);
      currentNote.attachmentUrl = presignedUrl.retrievalUrl;
      
      await patchNote(this.props.auth.getIdToken(), this.props.match.params.noteId, {
        name: currentNote.name,
        dueDate: currentNote.dueDate,
        done: currentNote.done,
        attachmentUrl: currentNote.attachmentUrl
      })

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
