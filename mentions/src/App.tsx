import React, { useEffect, useState, useRef, useCallback } from "react"
import './App.css';
import { Chat, Channel, MessageDraft, User, MixedTextTypedElement } from "@pubnub/chat"

function App() {
  const [chat, setChat] = useState<Chat>()
  const [text, setText] = useState("")

  const [channel, setChannel] = useState<Channel>()
  const [newMessageDraft, setNewMessageDraft] = useState<MessageDraft>()
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [nameOccurrenceIndex, setNameOccurrenceIndex] = useState<number>(-1)
  const [highlightedUser, setHighlightedUser] = useState<User>()
  const [highlightedOccurrenceIndex, setHighlightedOccurrenceIndex] = useState<number>(-1)
  const [renderedMessage, setRenderedMessage] = useState<MixedTextTypedElement[]>([])
  const [suggestedChannels, setSuggestedChannels] = useState<Channel[]>([])
  const [lastAffectedChannelOccurrenceIndex, setLastAffectedChannelOccurrenceIndex] = useState<number>(-1)
  const CHANNEL_NAME = "test-mentions-channel2"
  const inputRef = useRef<HTMLInputElement>(null)

  const onKeyUp = (e: React.FormEvent<HTMLInputElement>) => {
    if (!inputRef || !inputRef.current || !inputRef.current.selectionStart || !newMessageDraft) return;
    let currentlyHighlightedMention = newMessageDraft.getHighlightedMention(inputRef.current.selectionStart + 1)
    if (currentlyHighlightedMention.mentionedUser)
    {
      setHighlightedUser(currentlyHighlightedMention.mentionedUser)
      setHighlightedOccurrenceIndex(currentlyHighlightedMention.nameOccurrenceIndex)
    }
    else
    {
      setHighlightedUser(undefined)
      setHighlightedOccurrenceIndex(-1)
    }
  }

  /*
  async function handleSend(event: React.SyntheticEvent) {
    event.preventDefault()
    if (!text || !channel || !newMessageDraft) return
    newMessageDraft.send()
    setNewMessageDraft(channel.createMessageDraft({ userSuggestionSource: "channel"}))
    setRenderedMessage([])
    setText("")
  }
  */

  async function pickSuggestedUser(user:User) {
    if (!newMessageDraft) return

    newMessageDraft.addMentionedUser(
      user,
      nameOccurrenceIndex
    )

    setText(newMessageDraft.value)
    setRenderedMessage(newMessageDraft.getMessagePreview())
    
    setSuggestedUsers([])
    setNameOccurrenceIndex(-1)
    inputRef.current?.focus()
  }

  async function pickSuggestedChannel(channel:Channel)
  {
    if (!newMessageDraft) return
    newMessageDraft.addReferencedChannel(channel, lastAffectedChannelOccurrenceIndex)
    setText(newMessageDraft.value)
    setRenderedMessage(newMessageDraft.getMessagePreview())
    setSuggestedChannels([])
    setLastAffectedChannelOccurrenceIndex(-1)
    inputRef.current?.focus()
  }

  async function removeSuggestedUser(nameOccurrenceIndex:number) {
    if (!newMessageDraft) return
    newMessageDraft.removeMentionedUser(nameOccurrenceIndex)
    setText(newMessageDraft.value)
    setRenderedMessage(newMessageDraft.getMessagePreview())
    inputRef.current?.focus()
    setHighlightedUser(undefined)
  }

  const renderMessagePart = useCallback((messagePart: MixedTextTypedElement) => {
    if (messagePart.type === "text") {
      return messagePart.content.text
    }
    if (messagePart.type === "plainLink") {
      return <a href={messagePart.content.link}>{messagePart.content.link}</a>
    }
    if (messagePart.type === "textLink") {
      return <a href={messagePart.content.link}>{messagePart.content.text}</a>
    }
    if (messagePart.type === "mention") {
      return <span><a href={`https://pubnub.com/users/${messagePart.content.id}`}>{messagePart.content.name}</a> </span>
    }
    if (messagePart.type === "channelReference") {
      return <b>#{messagePart.content.name} </b>
    }
    return ""
  }, [])

  async function handleInput(event: React.FormEvent<HTMLInputElement>)
  {
    if (!newMessageDraft) return
    const response = await newMessageDraft.onChange(event.currentTarget.value)
    if (response.users.suggestedUsers?.length > 0)
    {
      setSuggestedUsers(response.users.suggestedUsers)
      setNameOccurrenceIndex(response.users.nameOccurrenceIndex)
    }
    else
    {
      setSuggestedUsers([])
      setNameOccurrenceIndex(-1)
    }
    if (response.channels.suggestedChannels?.length > 0)
    {
      setSuggestedChannels(response.channels.suggestedChannels)
      setLastAffectedChannelOccurrenceIndex(response.channels.channelOccurrenceIndex)
      console.log("Suggested Channels")
      console.log(response.channels.suggestedChannels)
    }
    else
    {
      setSuggestedChannels([])
      setLastAffectedChannelOccurrenceIndex(-1)
    }
    setRenderedMessage(newMessageDraft.getMessagePreview())
  }


  useEffect(() => {
    async function initalizeChat() {
      const chat = await Chat.init({
        publishKey: "pub-c-f41f1503-16e4-4c82-aa66-d29e231b7086",
        subscribeKey: "sub-c-9226da51-de37-4eb1-a5b1-7bbd42c8ab14",
        userId: "mentions-user",
      })
      
      setChat(chat)
      const { channel } = 
        await chat.createGroupConversation(
          {
            users: [ chat.currentUser ],
            channelId: CHANNEL_NAME,
            channelData: { name: "Mentions Demo Channel" }
          }
        )
      setChannel(channel)

      const testUser1 = 
        (await chat.getUser("mary")) ||
        (await chat.createUser("mary", {name: "Mary Carter"}))
      await channel.invite(testUser1)
      const testUser2 =
        (await chat.getUser("marian")) ||
        (await chat.createUser("marian", {name: "Marian Salazar"}))
      await channel.invite(testUser2)
      const testUser3 =
        (await chat.getUser("marin")) ||
        (await chat.createUser("marin", {name: "Marin Santiago"}))
      await channel.invite(testUser3)
      const testUser4 =
        (await chat.getUser("mandi")) ||
        (await chat.createUser("mandi", {name: "Mandi Turner"}))
      await channel.invite(testUser4)
      const testUser5 =
        (await chat.getUser("manpreet")) ||
        (await chat.createUser("manpreet", {name: "Manpreet Knight"}))
      await channel.invite(testUser5)
      let testChannel1 = await chat.getChannel("emea-support")
      if (!testChannel1) {
        await chat.createPublicConversation(
          {
            channelId: "emea-support",
            channelData: {name: "EMEA-Support"}
          }
          )
      }
      let testChannel2 = await chat.getChannel("emea-employees")
      if (!testChannel2) {
        await chat.createPublicConversation(
        {
          channelId: "emea-employees",
          channelData: {name: "EMEA-Employees"}
        }
        )
      }
      setNewMessageDraft(channel.createMessageDraft({ userSuggestionSource: "channel"}))
    }

    initalizeChat()
  }, [])

  if (!chat || !newMessageDraft) return <p>Loading...</p>

  return (
    <div className="App">
      <h2>User Mentions &amp; Channel References</h2>
      <div className="Help">
        <div>This channel is prepopulated with the following test users:
          <ul>
            <li>@Mary Carter, @Marian Salazar, @Marin Santiago</li>
            <li>@Mandi Turner, @Manpreet Knight</li>
            </ul>
            </div>
        <div>This keyset is prepopulated with the following test channels: 
          <ul>
            <li>#EMEA-Support</li>
            <li>#EMEA-Customers</li>
          </ul>
        </div>
      </div>
      <ol>
        <li>
      <div className="ChatMessage">
        <div className="ChatMessageInfo">The message will be rendered by the recipient as follows:
          {text === "" && <span className="ChatMessageStartTyping"> (Please Start typing)</span>}
        </div>
          <p className="MessageText">{renderedMessage.map((messagePart: MixedTextTypedElement, i: number) => (
            <span key={String(i)}>{renderMessagePart(messagePart)}</span>
              ))}
          </p>
        </div>
      </li>
      </ol>
        <form className="message-input">
        <input
          ref={inputRef}
          autoFocus
          autoComplete="off"
          type="text"
          value={text}
          onKeyUp={onKeyUp}
          onChange={(e) => {
            setText(e.target.value)
            handleInput(e)
          }}
          placeholder="Enter your message"
        />
        {/*<input type="submit" value="➔" onClick={handleSend} />*/}
      </form>
      {suggestedUsers.length > 0 && <div className="SuggestedUsersArea">Add User:  
      {suggestedUsers.map((user) => (
        <span className="SuggestionBubbleAdd" onClick={() => pickSuggestedUser(user)}>{user.name}</span>          
      ))}
      </div>}
      {highlightedUser && <div className="SuggestedUsersArea">Remove User: 
      {highlightedUser && <span className="SuggestionBubbleRemove" onClick={() => removeSuggestedUser(highlightedOccurrenceIndex)}>{highlightedUser.name}</span>}
      </div>}
      {suggestedChannels.length > 0 && <div className="SuggestedUsersArea">Add Channel:
      {suggestedChannels.map((channel) => (
        <span className="SuggestionBubbleAdd" onClick={() => pickSuggestedChannel(channel)}>{channel.name}</span>  
      ))}
      </div>}
    </div>
  );
}

export default App;
