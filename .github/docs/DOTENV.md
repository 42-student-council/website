# .env File

In order to build the website yourself, you will need to create a .env file.

## What is a .env File?

A .env file is a text file containing environment variables. These are used to configure your app's settings, such as credentials, which should _never_ be hard-coded in your source code.

## What Variables Do I Need?

We got you! Check the [.env.example](../../.env.example).

## Set Up 42-OAuth

Here is how OAuth Authentification works:
1. **User Initiates Authentication**: When a user tries to log in, they are redirected to the 42 Network's authentication page.
2. **User Authorizes Application**: The user logs in and authorizes the application to access their information.
3. **Provider Redirects Back**: Upon successful authentication, the 42 Network redirects the user back to your application's callback URL with an authorization code.
4. **Exchange Code for Token**: Your application exchanges the authorization code for an access token.
5. **Authenticated Requests**: The access token is used to make authenticated requests to the 42 Network's API on behalf of the user.

In order to configure this, you need to create an application on the 42 Intranet under Setting -> API -> Register A New App.

You will be asked for a **Redirect URI**. This is the URI the user will be redirected to upon successful authentication.

This should be as follows: `http://<IP>:5173/oauth/callback`

Once you are done, you will get a UID and a secret, which you can use for authenticating your app. You can then add these to your .env file as follows:
```.env
CLIENT_ID=<UID>
CLIENT_SECRET=<SECRET>
```

## Set Up Discord Webhook

1. Create a Discord Server:
    * If you do not already have a server, create a new one. This can be your personal development server.
2. Create a Webhook:
    * Navigate to the channel where you want to receive the messages.
    * Click on the settings icon next to the channel name.
    * In the channel settings, go to the 'Integrations' tab.
    * Click on 'Create Webhook'.
3. Copy the Webhook URL:
    * It should look something like this:
```
https://discord.com/api/webhooks/<WEBHOOK_ID>/<WEBHOOK_TOKEN>
```
4. Add the Webhook ID and Token to Your .env File:
    * Split the webhook URL to extract the <WEBHOOK_ID> and <WEBHOOK_TOKEN>.
    * Add these to your .env file:
```.env
DISCORD_WEBHOOK_ID=<WEBHOOK_ID>
DISCORD_WEBHOOK_TOKEN=<WEBHOOK_TOKEN>
```

# REMINDER
Pushing private credentials on an open source project poses a **huge** security issue. We _will_ deny any pull request containing them and we _might_ prank you using your credentials 😉.
