#fsd #project #structure #layers

Layers:

- App — everything that makes the app run — routing, entrypoints, global styles, providers.
- Processes (deprecated) — complex inter-page scenarios.
- Pages — full pages or large parts of a page in nested routing.
- Widgets — large self-contained chunks of functionality or UI, usually delivering an entire use case.
- Features — reused implementations of entire product features, i.e. actions that bring business value to the user.
- Entities — business entities that the project works with, like user or product.
- Shared — reusable functionality, especially when it's detached from the specifics of the project/business, though not necessarily.

- [Overview | Feature-Sliced Design](https://feature-sliced.design/docs/get-started/overview#layers)
