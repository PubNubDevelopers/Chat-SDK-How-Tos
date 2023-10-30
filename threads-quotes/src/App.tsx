import React, { useEffect, useState } from "react"
import './App.css';
import { Chat, Message, Channel, ThreadChannel, MessageDraft } from "@pubnub/chat"

function App() {
  const [chat, setChat] = useState<Chat>()
  const [text, setText] = useState("")
  const [channel, setChannel] = useState<Channel>()
  const [threadChannel, setThreadChannel] = useState<ThreadChannel>()
  const [rootMessage, setRootMessage] = useState<Message>()
  const [threadMessages, setThreadMessages] = useState<Message[]>([])
  const [newMessageDraft, setNewMessageDraft] = useState<MessageDraft>()
  const [quotedMessagePreview, setQuotedMessagePreview] = useState("")
  const CHANNEL_NAME = "test-threads-channel"
  const THREAD_MESSAGE_TEXT = "What is everyone doing this weekend? 🧵"
  const THREAD_REPLY_TEXT = "Taking my children to the park 🛝"

  async function handleSend(event: React.SyntheticEvent) {
    event.preventDefault()
    if (!text || !threadChannel || !newMessageDraft) return

    newMessageDraft.send()
    setNewMessageDraft(threadChannel.createMessageDraft())
    setQuotedMessagePreview("")
    setText("")
  }

  async function handleInput(event: React.FormEvent<HTMLInputElement>)
  {
    //  No special rendering for Message Draft with this app
    if (!newMessageDraft) return
    const response = await newMessageDraft.onChange(event.currentTarget.value)
  }

  async function handleQuoteMessage(message: Message)
  {
    if (!newMessageDraft) return;
    setQuotedMessagePreview(message.text)
    newMessageDraft.addQuote(message)
  }

  async function handleResetApp()
  {
    if (!channel) return;
    await channel.sendText(THREAD_MESSAGE_TEXT)
    window.location.reload();
  }

  useEffect(() => {
    if (!threadChannel) return
    return threadChannel.connect((message) => setThreadMessages((messages) => [...threadMessages, message]))
  }, [threadChannel, threadMessages])

  useEffect(() => {
    async function initalizeChat() {
      const chat = await Chat.init({
        publishKey: "pub-c-f41f1503-16e4-4c82-aa66-d29e231b7086",
        subscribeKey: "sub-c-9226da51-de37-4eb1-a5b1-7bbd42c8ab14",
        userId: "threads-user",
      })
      
      setChat(chat)
      
      const { channel } = 
        await chat.createGroupConversation(
          {
            users: [ chat.currentUser ],
            channelId: CHANNEL_NAME,
            channelData: { name: "Thread Demo Channel" }
          }
        )
      setChannel(channel)

      let { messages } = await channel.getHistory( {count: 1} )
      if (!messages || messages.length !== 1 ) {
        await handleResetApp();
        return;
      }
      let rootMessage = messages[0]
      setRootMessage(rootMessage)

      if (rootMessage.content.text !== THREAD_MESSAGE_TEXT)
      {
        //  There is no historical thread message 
        //  - either the message was deleted (persistence on this keyset is only one day) or 
        //  - a new channel was created
        await handleResetApp();
      }
      else{
        //  Read the existing thread responses to the root message
        if (!rootMessage.hasThread)
        {
          const threadChannel = await rootMessage.createThread()
          await threadChannel.sendText(THREAD_REPLY_TEXT)
        }
        const threadChannel = await rootMessage.getThread()
        setThreadChannel(threadChannel)
        //  Read any existing thread messages - max of 15 is just to make the demo simple
        let { messages } = await threadChannel.getHistory({count: 15})
        setThreadMessages(messages)
        setNewMessageDraft(threadChannel.createMessageDraft())
      }
    }

    initalizeChat()
  }, [])

  if (!chat || !rootMessage || !threadMessages) return <p>Loading...</p>

  return (
    <div className="App">
      <h2>Message Threads &amp; Quoted Messages</h2>
      <div className="ResetApp" onClick={() => handleResetApp()}>⚠️ Reset App State Globally ⚠️</div> 
      <ol>
          {[rootMessage].map((message) => {
            return (
              <li key={message.timetoken}>
                <div className="ChatMessage">
                  <p className="MessageText">
                    {message.text}
                  </p>
                </div>
                <ol className="OrderedListInThread">
                {threadMessages.map((threadMessage) => {
                  return (
                    <li key={threadMessage.timetoken} className="ListItemInThread">
                      <div className="ChatMessageInThread">
                      <div className="MessageTextInThread">
                      {threadMessage.quotedMessage && <div className="ChatMessageQuoteInThread">{threadMessage.quotedMessage.text}</div>}
                      {threadMessage.text}
                      </div>
                      </div>
                      <div className="QuoteThisArea" onClick={() => handleQuoteMessage(threadMessage)}>
                        <div className="QuoteThisInterior">
                          <img src="./quote.png" width="16" height="10" />
                           &nbsp;[Quote]
                        </div>
                      </div>
                    </li>
                  )
                })}
                </ol>
              </li>
            )
          })}
        </ol>
        {quotedMessagePreview !== "" && <div className="QuotedMessagePreview">{quotedMessagePreview}</div>}
        <form className="message-input" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            handleInput(e)
          }}
          placeholder="Reply in Thread"
        />
        <input type="submit" value="➔" onClick={handleSend} />
      </form>
    </div>
  );
}

export default App;
