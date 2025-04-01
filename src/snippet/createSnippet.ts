import { fillPrompt } from "type-safe-prompt"
import { snippetTemplate, disableSendEnterEntry } from "./template"

type CreateSnippetOptions = {
  disableSendEnter: boolean
}

export const createSnippet = ({
  disableSendEnter,
}: CreateSnippetOptions): string => {
  return fillPrompt(snippetTemplate, {
    additionalEntryProcess: disableSendEnter ? disableSendEnterEntry : "",
  })
}
