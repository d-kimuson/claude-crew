/* eslint-disable no-useless-escape */
export const snippetTemplate = /* javascript */ `
/**
 * Helper script for Claude Desktop
 * Open Developer Console with Cmd + Alt + Shift + i and paste this script to execute
 * Two windows will open - paste into the one showing "AI" log (https://claude.ai/new)
 *
 * Features:
 * - Auto-approve trusted tools
 * - Reassigns Enter key to newline instead of send. Modifier keys are not affected, so you can still send with Ctrl + Enter or Command + Enter
 *
 * Supported languages:
 * - English
 * - Japanese
 */

const trustedTools = [] // You can add other tools to this array
const trustedPrefixes = ["claude-crew-"] // You can add other prefixes to this array

let lastExecution = 0
const COOLDOWN_MS = 500

const autoApprove = () => {
  const dialog = document.querySelector("[role=dialog]")
  if (!dialog) {
    return false
  }

  const toolDiv = dialog.querySelector("button > div")
  const toolName =
    toolDiv.textContent?.match(/Run (\S+) from/)?.at(1) ?? // English
    toolDiv.textContent?.match(/(\S+)から(\S+)を実行/)?.at(2) // Japanese
  const allowButton = dialog.querySelector("[type=button]")

  if (!toolName || !allowButton) {
    console.error(
      "No tool name or Allow button found",
      toolName,
      allowButton
    )
    return false
  }

  if (
    trustedTools.includes(toolName) ||
    trustedPrefixes.some((prefix) => toolName.startsWith(prefix))
  ) {
    console.log("Auto-approving trusted tool:", toolName)
    allowButton.click()
  } else {
    console.log("Skipping non-trusted tool:", toolName)
  }

  return true
}

const isMessageElement = (element) => {
  if (element.tagName === "TEXTAREA") return true

  const editable = element.getAttribute("contenteditable")
  return editable === "true"
}

const handleKeydown = (event) => {
  if (!isMessageElement(event.target)) {
    return
  }

  // Only Enter key pressed
  const isOnlyEnter =
    event.key === "Enter" && !(event.ctrlKey || event.metaKey || event.shiftKey)

  // Disable Enter and replace with Shift+Enter for newline
  // Not handled when modifier keys are present, so you can still send with any modifier key
  if (isOnlyEnter) {
    // Cancel standalone Enter event
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()

    // Dispatch new Shift+Enter event
    const newEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      shiftKey: true,
      ctrlKey: false,
      metaKey: false,
      isTrusted: true,
      composed: true,
    })
    event.target.dispatchEvent(newEvent)
  }
}

// Execute Script
const observer = new MutationObserver((mutations) => {
  const now = Date.now()

  if (now - lastExecution < COOLDOWN_MS) {
    return
  }

  try {
    autoApprove()
  } catch (error) {
    console.error(error)
  } finally {
    lastExecution = now
  }
})

const entry = () => {
  if (window.customScriptEnabled) {
    console.log("Custom script is already enabled, skipping.")
    return
  }

  // Start observing
  console.log(
    "👀 Starting observation for AutoApprove tools.",
    trustedTools,
    trustedPrefixes
  )
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  {{additionalEntryProcess}}

  window.customScriptEnabled = true
  console.log("Custom script has been enabled.")
}

entry()
`

export const disableSendEnterEntry = /* javascript */ `
  // WARN: Claude's main listener is set on document with capture, so we need window & capture to handle it first
  window.addEventListener("keydown", handleKeydown, { capture: true })
  console.log("Set up listener for key binding modifications.")
`
