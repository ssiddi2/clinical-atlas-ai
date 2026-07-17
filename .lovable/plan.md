## Prevent duplicate empty ATLAS chats

**Goal:** When the user clicks "New Conversation" in ATLAS and the current chat is already empty (no messages sent), do nothing instead of creating another empty chat.

### Change
In `src/pages/Atlas.tsx`, update the "New Conversation" click handler:
- Before creating a new conversation, check if the currently active conversation has zero messages.
- If it is already empty, no-op (optionally focus the input) instead of spawning another empty chat.
- Otherwise, proceed with the existing new-chat creation flow.

Also apply the same guard to any keyboard shortcut or programmatic path that creates a new chat, so empty chats can never stack.

No backend, schema, or styling changes.