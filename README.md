# Chat-SDK-How-Tos

Simple demos showing how to use specific aspects of the Chat SDK

| Demo Code | Description | Hosted Demo |
| --- | --- | --- |
| User Presence & Membership (Work In Progress) |  Shows how to join and leave channels as well as channel presence events.  Accompanying how-to: [How to Manage User Presence and Membership](https://pubnub.com/how-to/chat-sdk-manage-user-presence-membership/). | TBD
| [Add Reactions and Emoji to Messages](https://github.com/PubNubDevelopers/Chat-SDK-How-Tos/tree/main/reactions) | Show how to add, remove and manage message reactions.  Accompanying How-to: [How to add Reactions and Emoji to Messages](https://pubnub.com/how-to/chat-sdk-add-reactions-to-messages/) | [Hosted Demo](https://chat-sdk-how-to-reactions.netlify.app/) |
| [Create Threads and Quote Messages](https://github.com/PubNubDevelopers/Chat-SDK-How-Tos/tree/main/threads-quotes) | Start a message thread, contribute to that thread and quote messages on that thread.  Accompanying How-to: [How to Create Threads and Quote Messages](https://pubnub.com/how-to/chat-sdk-create-threads-and-quote-messges/) | [Hosted Demo](https://chat-sdk-how-to-threads-quotes.netlify.app/) |
| [Mention Users and Channels](https://github.com/PubNubDevelopers/Chat-SDK-How-Tos/tree/main/mentions) | Tag @Users and #Channels to give them context, allowing the recpient to take action such as hyperlinking to that user's profile.  Accompanying How-to: [How to Mention Users and Channels](https://pubnub.com/how-to/chat-sdk-mention-users/) | [Hosted Demo](https://chat-sdk-how-to-mentions.netlify.app/) |
| Moderate & Report Message | Coming soon... | Coming soon... |


## Usage Notes

These demos are designed to be used within their accompanying how-tos (see the links in the table at the top of this ReadMe) which will include instructions and context .  

## Installing / Getting started

To run any of these projects yourself you will need a PubNub account

- [PubNub Account](#pubnub-account) (*Free*)

<a href="https://admin.pubnub.com/signup">
	<img alt="PubNub Signup" src="https://i.imgur.com/og5DDjf.png" width=260 height=97/>
</a>

### Get Your PubNub Keys

1. You’ll first need to sign up for a [PubNub account](https://admin.pubnub.com/signup/). Once you sign up, you can get your unique PubNub keys from the [PubNub Developer Portal](https://admin.pubnub.com/).

1. Sign in to your [PubNub Dashboard](https://admin.pubnub.com/).

1. Click Apps, then **Create New App**.

1. Give your app a name, and click **Create**.

1. Click your new app to open its settings, then click its keyset.

1. Enable the Presence feature on your keyset (check 'Presence Deltas' and 'Generate Leave on TCP FIN or RST')

1. Enable the Message Persistence feature on your keyset and choose a duration

1. Enable the Stream Controller feature on your keyset

1. Enable the App Context feature on your keyset.  Make sure you check all the checkboxes related to events, i.e. User and Channel Metadata Events as well as Membership Events.

1. The hosted variant of this app uses Functions for moderation, specifically [https://www.pubnub.com/integrations/chat-message-profanity-filter/](https://www.pubnub.com/integrations/chat-message-profanity-filter/).

1. Copy the Publish and Subscribe keys and paste them into your app as specified in the next step.

### Building and Running

1. Clone the repository

1. Replace the hard coded Pub/Sub keys for each demo with your own keys you generated in the previous step.  The hardcoded keys used by the demos are restricted to the specific user IDs and channels defined by the demo, so you will need your own keys to build your own app.

```shell
git clone https://github.com/PubNubDevelopers/Chat-SDK-How-Tos.git
cd Chat-SDK-How-Tos
cd <sample>
yarn
yarn start
```

## Contributing
Please fork the repository if you'd like to contribute. Pull requests are always welcome.
