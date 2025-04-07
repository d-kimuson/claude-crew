import { fillPrompt } from "type-safe-prompt"
import { snippetTemplate, disableSendEnterEntry } from "./template"

type CreateSnippetOptions = {
  projectName: string
  disableSendEnter: boolean
}

export const createSnippet = ({
  projectName,
  disableSendEnter,
}: CreateSnippetOptions): string => {
  return fillPrompt(snippetTemplate, {
    projectName,
    additionalEntryProcess: disableSendEnter ? disableSendEnterEntry : "",
  })
}
