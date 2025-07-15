# Mezon Bot News

A Node.js-based bot for handling chat commands and providing news updates.

## Features

- Responds to chat commands such as `*ping`, `*help`, `*categories`, and `*news`.
- Fetches and displays news based on user input.
- Built with TypeScript for type safety and scalability.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd mezon-bot-news
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env` and configure the required values.

## Running the App

- **Development Mode**:

  ```bash
  npm run start:dev
  ```

- **Production Mode**:

  ```bash
  npm run start
  ```

## Chat Commands

The bot supports the following commands:

- `*ping`: Check if the bot is online.
- `*help`: Get a list of available commands.
- `*categories`: List available news categories.
- `*news <source>`: Fetch news from a specific source.

## Project Structure

```
src/
├── app.ts               # Application entry point
├── container.ts         # Dependency injection container
├── index.ts             # Main file
├── server.ts            # Server setup
├── configs/             # Configuration files
├── constants/           # Constants (e.g., chat commands, error messages)
├── entities/            # Database entities
├── errors/              # Custom error classes
├── helpers/             # Utility functions
├── interfaces/          # TypeScript interfaces
├── middlewares/         # Express middlewares
├── models/              # Data models
├── services/            # Business logic
├── types/               # Type definitions
```

## Testing

- **Unit Tests**:

  ```bash
  npm run test
  ```

- **End-to-End Tests**:

  ```bash
  npm run test:e2e
  ```

- **Test Coverage**:

  ```bash
  npm run test:cov
  ```

## License

This project is licensed under the MIT License.