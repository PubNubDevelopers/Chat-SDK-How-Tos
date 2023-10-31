import React, { useCallback, useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Channel, Chat, Message, MixedTextTypedElement, TimetokenUtils, User } from "@pubnub/chat"

export default function App() {
  const [chat, setChat] = useState<Chat>()
  const [otherUser, setOtherUser] = useState<User>()
  const [channel, setChannel] = useState<Channel>()

  const [membershipMsg, setMembershipMsg] = useState("")
  const [presenceMsg, setPresenceMsg] = useState("")
  const [disconnect, setDisconnect] = useState(() => () => console.log('default disconnect function'))

  async function join()
  {
    if (chat)
    {
      const channel = await chat.getChannel("test-channel-public")
      const channelMembership = await channel?.join(() => null)
      channelMembership?.membership.streamUpdates(async (membership) => {
        await updateMembershipUI()
      })
      await updateMembershipUI()
      const disconnectFunction = await channel?.connect((message: Message) => { })
      setDisconnect(() => () => disconnectFunction)
      console.log('joined channel')
    }
  }

  async function updateMembershipUI()
  {
    if (chat)
    {
      const myMemberships = await chat.currentUser.getMemberships()
      setMembershipMsg("Number of channels I am a member of: " + myMemberships.memberships.length)
    }
  }

  async function updatePresenceUI(userIds: string[])
  {
    console.log("Currently present users: ", userIds)
        var presentUsers = "Present Users (" + userIds.length + "): "
        userIds.forEach((userId) => {
          presentUsers += userId + ", "
        }) 
        setPresenceMsg(presentUsers)
  }

  async function leave()
  {
    if (chat)
    {
      const channel = await chat.getChannel("test-channel-public")
      const leaveResult = await channel?.leave();
      //  Try to force the presence leave event
      await disconnect()
      console.log('left channel')
    }
  }

  async function wherePresent()
  {
    if (channel)
    {
      const channelIds = await channel.whoIsPresent()
      updatePresenceUI(channelIds)
    }
  }

  async function deleteChat()
  {
    window.location.href="http://www.pubnub.com"
  }

  useEffect(() => {
    async function initalizeChat() {
      const queryParams = document.location.search
      let userId
      let userIdThem
      if (queryParams.includes("primary")) {
        userId = "primary"
        userIdThem = "secondary"
      }
      else
      {
        userId = "secondary"
        userIdThem = "primary"
      }

      const chat = await Chat.init({
        publishKey: "pub-c-f41f1503-16e4-4c82-aa66-d29e231b7086",
        subscribeKey: "sub-c-9226da51-de37-4eb1-a5b1-7bbd42c8ab14",
        userId: userId,
      })
      
      const userThem = (await chat.getUser(userIdThem)) || await chat.createUser(userIdThem, { name: userIdThem})
      
      setChat(chat)
      setOtherUser(userThem)
      
      var channel = await chat.getChannel("test-channel-public")
      if (!channel)
      {
        channel = await chat.createPublicConversation(
          {
            channelId: "test-channel-public",
            channelData: { name: "Test Channel" }
          }
        )
      }
      const myMemberships = await chat.currentUser.getMemberships()
      setMembershipMsg("Number of channels I am a member of: " + myMemberships.memberships.length)

      setChannel(channel)

      const stopUpdates = channel.streamPresence((userIds: string[]) => {
        updatePresenceUI(userIds)
      })
    }

    initalizeChat()
  }, [])

  if (!chat ) return <p>Loading...</p>

  return (
    <main>
      <h1>Presence: Channel Presence</h1>
      <h3>User: {chat.currentUser.name}</h3> <button onClick={() => join()}>Join Channel</button> <button onClick={() => leave()}>Leave Channel</button> <button onClick={() => wherePresent()}>Query presence for test channel</button> {/*<button onClick={() => deleteChat()}>Delete Chat</button>
      <h3>User: {users[1].name}</h3> <button onClick={() => join(1)}>Join Channel</button> <button onClick={() => leave(1)}>Leave Channel</button> <button onClick={() => wherePresent(1)}>Where Present?</button>*/}
      <h3>Presence Information for Test Channel:</h3>
        <span>{presenceMsg}</span>
      <h3>Membership Information:</h3>
        <span>{membershipMsg}</span>
      

      

    </main>
  )
}
