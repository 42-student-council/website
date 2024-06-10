# .env File

In order to build the website locally, you will need to create a .env file.

## What is a .env File?

A .env file is a text file containing environment variables. These are used to configure your app's settings, such as credentials, which should _never_ be hard-coded in your source code.

## What Variables Do I Need?

We got you!

```.env
# These can be set to anything when building locally.
POSTGRES_DB=mydatabase
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword

# Do not change these even when building locally!
POSTGRES_HOST=db                       # Name of the database service.
POSTGRES_PORT=5432                     # Default postgres port.

# These are used for globally configuring your IP adress.
BASE_URL="http://<IP>:3000"            # Frontend base URL.
API_BASE_URL="http://<IP>:8000/api"    # Base URL for api calls.

# This is not needed for building locally, you can set it to whatever.
SESSION_SECRET="-42"

# These are needed for 42OAuth configuration. You do not need that for development unless you are directly working on 42OAuth-related code. If that is the case, see the bottom section of this doc.
CLIENT_ID="u-s4tud(...)"
CLIENT_SECRET="s-s4tud(...)"
```

## I Want 42OAuth to Work

Here is how OAuth Authentification works:
1. **User Initiates Authentication**: When a user tries to log in, they are redirected to the 42 Network's authentication page.
2. **User Authorizes Application**: The user logs in and authorizes the application to access their information.
3. **Provider Redirects Back**: Upon successful authentication, the 42 Network redirects the user back to your application's callback URL with an authorization code.
4. **Exchange Code for Token**: Your application exchanges the authorization code for an access token.
5. **Authenticated Requests**: The access token is used to make authenticated requests to the 42 Network's API on behalf of the user.

In order to configure this, you need to create an application on the 42 Intranet under Setting -> API -> Register A New App.

You will be asked for a **Redirect URI**. This is the URI the user will be redirected to upon successful authentication.

This should be as follows: `http://<IP>:3000/oauth/callback`

Once you are done, you will get a UID and a secret, which you can use for authenticating your app. You can then add these to your .env file as follows:
```.env
CLIENT_ID=<UID>
CLIENT_SECRET=<SECRET>
```
**DO NOT** push any of these!!
