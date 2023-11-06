import React, { useEffect, useState } from 'react';
import './App.css';
import { publish_key, subscribe_key } from './keys';
import { Chat, Membership } from "@pubnub/chat"

export default function App() {
  const [chat, setChat] = useState<Chat>()
  const [myMemberships, setMyMemberships] = useState<Membership[]>([])

  const USER_ID = "membership-user"
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
      //  IN PRODUCTION: Replace with your own logic to request an Access Manager token
      //  For brevity, this demo does not request a new token after timeout
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
