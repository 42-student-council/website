# Frontend

For the frontend we use [Remix](https://remix.run/).

- 📖 [Remix docs](https://remix.run/docs)
- [Tailwind CSS docs](https://tailwindcss.com/docs)

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

We have a `Dockerfile` which you can use for easy deployment. But if you want to
deploy it manually follow those steps:

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`
