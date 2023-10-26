import React, { useEffect, useState } from "react"
import './App.css';
import { Chat, Message } from "@pubnub/chat"

function App() {
  const [chat, setChat] = useState<Chat>()
  const [messages, setMessages] = useState<Message[]>([])
  const CHANNEL_NAME = "test-reactions-channel"

  async function handleClick(message: Message, reaction: string)
  {
    console.log(message.reactions)
    await message.toggleReaction(reaction)
  }

  useEffect(() => {
    if (!messages.length) return
    return Message.streamUpdatesOn(messages, setMessages)
  }, [messages])

  useEffect(() => {
    async function initalizeChat() {
      const chat = await Chat.init({
        publishKey: "pub-c-f41f1503-16e4-4c82-aa66-d29e231b7086",
        subscribeKey: "sub-c-9226da51-de37-4eb1-a5b1-7bbd42c8ab14",
        userId: "reactions-user",
      })
      
      setChat(chat)
      
      const { channel } = 
        await chat.createGroupConversation(
          {
            users: [ chat.currentUser ],
            channelId: CHANNEL_NAME,
            channelData: { name: "Reactions Channel" }
          }
        )

      let { messages } = await channel.getHistory({count: 3})

      //  If this is a new channel, populate it with some test messages
      if (!messages || messages.length < 3)
      {
        await channel.sendText("How is everybody doing?")
        await channel.sendText("Looks like it's going to be a sunny day today")
        await channel.sendText("Wow, the PubNub Chat SDK is cool")
        let { messages } = await channel.getHistory({count: 3})
        setMessages(messages)
      }
      else {
        setMessages(messages)
      }

    }

    initalizeChat()
  }, [])

  if (!chat ) return <p>Loading...</p>

  return (
    <div className="App">
      Left click to toggle 🙂 | Right click to toggle 🥳
      <ol>
          {messages.map((message) => {
            return (
              <li key={message.timetoken}>
                <div className="ChatMessage" onClick={() => handleClick(message, "🙂")} onContextMenu={(e) => {e.preventDefault();handleClick(message, "🥳")}}>
                  <p className="MessageText">
                    {message.text}
                  </p>
                </div>
                <div className="EmojiArea">
                  {message.reactions["🙂"] && message.reactions["🙂"].length !== 0 ? "🙂" : ""}
                  {message.reactions["🥳"] && message.reactions["🥳"].length !== 0 ? "🥳" : ""}
                </div>
              </li>
            )
          })}
        </ol>
    </div>
  );
}

export default App;
