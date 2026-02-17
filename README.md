# The Newsvendor Game

An open-source implementation of the classic newsvendor problem—an excellent introduction to inventory management and the asymmetric risk of ordering too high or too low. The game uses a croissant bakery setting for a modern, relatable context.

## 🎮 Play Online

**Try it now:** https://newsvendor-kostas.web.app/

The game is hosted on Firebase and is free to play for classroom and workshop use.

## 📚 About the Game

The newsvendor game teaches fundamental principles of inventory management:
- Understanding the cost structure of overstocking vs. understocking
- Learning the concept of the critical fractile
- Making optimal ordering decisions under demand uncertainty
- Analyzing performance through profit/loss feedback

Players take on the role of a bakery owner, making weekly order decisions for a product with uncertain demand. Each week consists of 5 daily delivery decisions, followed by demand revelation and profit calculation.

## 🚀 Getting Started as a Host

1. Visit https://newsvendor-kostas.web.app/
2. Log in as a host with your chosen password
3. Create a new session and share the Game ID with players
4. Monitor the lobby and manage player connections
5. Customize game parameters (decision periods, demand distribution, cost structure)
6. Start the game when all players are ready

Players can reconnect at any time using their Game ID and name, even if temporarily disconnected.

## 👥 For Players

1. Enter the Game ID shared by your host
2. Choose a memorable name
3. Each week, decide how many croissants to order
4. After 5 daily decisions, demand is revealed and you see your profit/loss
5. Continue across multiple weeks to improve your strategy

## 🛠️ Self-Hosting

To host your own instance for free, see the [hosting guide](https://github.com/siemsene/newsvendor/blob/main/Howtohost.md).

The game runs on Firebase Cloud. Free tier usage covers typical classroom sessions (up to ~200 players/day across all instances).

## 💻 Technology Stack

- **Frontend:** TypeScript, Vite
- **Backend:** Firebase (Firestore, Cloud Functions)
- **Hosting:** Firebase Hosting

## 📋 License

This project is open source under the [MIT License](https://opensource.org/licenses/MIT). You're free to use, modify, and distribute it—just include the original copyright notice.

## 🤝 Contributing

Feedback and contributions are welcome! If you use this in your classroom or find issues, please share your experience.

## 📖 Learn More

- [Newsvendor Problem (Wikipedia)](https://en.wikipedia.org/wiki/Newsvendor_model)
- Optimal ordering strategy: Order the critical fractile quantity based on cost ratio and demand distribution