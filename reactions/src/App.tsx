import React, { useEffect, useState } from "react"
import './App.css';
import { publish_key, subscribe_key } from './keys';
import { Chat, Message } from "@pubnub/chat"

function App() {
  const [chat, setChat] = useState<Chat>()
  const [messages, setMessages] = useState<Message[]>([])
  const CHANNEL_NAME = "test-reactions-channel"
  const USER_ID = "reactions-user"

  async function handleClick(message: Message, reaction: string)
  {
    await message.toggleReaction(reaction)
  }

  useEffect(() => {
    if (!messages.length) return
    return Message.streamUpdatesOn(messages, setMessages)
  }, [messages])

  useEffect(() => {
    async function initalizeChat() {
      //  IN PRODUCTION: Replace with your own logic to request an Access Manager token
      //  For brevity, this demo does not request a new token after timeout (chat.sdk.setToken())
      const accessManagerToken = await requestAccessManagerToken(USER_ID)
      if (accessManagerToken === null)
      {
        console.log("Error retrieving access manager token")        
        return
      }
      const chat = await Chat.init({
        publishKey: publish_key,
        subscribeKey: subscribe_key,
        userId: USER_ID,
        authKey: accessManagerToken
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
        window.location.reload()
        return
      }
      else {
        setMessages(messages)
      }

    }

    initalizeChat()
  }, [])

  //  ONLY REQUIRED FOR THE DEMO TO USE ACCESS-MANAGER RESTRICTED KEYS.  DO NOT COPY INTO YOUR OWN CODE
  async function requestAccessManagerToken (userId: string) {
    try {
      const TOKEN_SERVER =
        'https://devrel-demos-access-manager.netlify.app/.netlify/functions/api/chatsdk-how-tos'
      const response = await fetch(`${TOKEN_SERVER}/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ UUID: userId })
      })
      const token = (await response.json()).body.token
      return token
    } catch (e) {
      console.log('failed to create token ' + e)
      return null
    }
  }

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
