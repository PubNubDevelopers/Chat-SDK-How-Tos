import React, { useEffect, useState } from 'react';
import './App.css';
import { Chat, Membership } from "@pubnub/chat"

export default function App() {
  const [chat, setChat] = useState<Chat>()
  const [myMemberships, setMyMemberships] = useState<Membership[]>([])

  const CHANNEL_NAME_1 = "test-membership-channel-1"
  const CHANNEL_NAME_2 = "test-membership-channel-2"

  async function join(channelName: string)
  {
    if (chat)
    {
      const channel = await chat.getChannel(channelName)
      const channelMembership = await channel?.join(() => null)
      channelMembership?.membership.streamUpdates(async (membership) => {
        //  Stream updates on the channel as follows
        console.log(membership)
      })
      
      //  For brevity, ignore that this call could contain multiple pages of memberships
      const {memberships} = await chat.currentUser.getMemberships()
      setMyMemberships(memberships) 
    }
  }

  async function leave(channelName: string)
  {
    if (chat)
    {
      const channel = await chat.getChannel(channelName)
      await channel?.leave();
      //  For brevity, ignore that this call could contain multiple pages of memberships
      const {memberships} = await chat.currentUser.getMemberships()
      setMyMemberships(memberships) 
    }
  }

  useEffect(() => {
    async function initalizeChat() {
      const chat = await Chat.init({
        publishKey: "pub-c-f41f1503-16e4-4c82-aa66-d29e231b7086",
        subscribeKey: "sub-c-9226da51-de37-4eb1-a5b1-7bbd42c8ab14",
        userId: "membership-user"    
      })
      
      setChat(chat)

      await chat.currentUser.update({name: "Test User"})
      const {memberships} = await chat.currentUser.getMemberships()
      setMyMemberships(memberships)
      
      let channel1 = await chat.getChannel(CHANNEL_NAME_1)
      if (!channel1)
      {
        channel1 = await chat.createPublicConversation(
          {
            channelId: CHANNEL_NAME_1,
            channelData: { name: "Test Channel 1" }
          }
        )
      }
      let channel2 = await chat.getChannel(CHANNEL_NAME_2)
      if (!channel2)
      {
        channel2 = await chat.createPublicConversation(
          {
            channelId: CHANNEL_NAME_2,
            channelData: { name: "Test Channel 2" }
          }
        )
      }
    }

    initalizeChat()
  }, [])

  if (!chat ) return <p>Loading...</p>

  return (
    <div className="App">
      <h2>Channel Membership for {chat.currentUser.name}</h2>
      <div className="Info">Join or Leave two predefined test channels.  You will be notified when your membership status changes</div>
      <div className="Info">Refresh to see that this data persists</div>
      <div className="ButtonSelection">
      <button onClick={() => join(CHANNEL_NAME_1)}>Join Channel 1</button> 
      <button onClick={() => join(CHANNEL_NAME_2)}>Join Channel 2</button> 
      <button onClick={() => leave(CHANNEL_NAME_1)}>Leave Channel 1</button> 
      <button onClick={() => leave(CHANNEL_NAME_2)}>Leave Channel 2</button> 
      </div>
      <h3>Membership Information:</h3>
        <ol className="">
        {myMemberships.length === 0 && <li>Not a member of any channels</li>}
        {myMemberships.map((membership) => {
          return (
            <li key={membership.channel.name} className="">
              <div>{membership.user.name} is a member of {membership.channel.name}</div>
              </li>
            )
        })}
        </ol>

    </div>
  )
}
