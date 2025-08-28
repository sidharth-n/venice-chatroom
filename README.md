# Venice Chatroom 🎭

A beautiful React TypeScript application that simulates AI character conversations using Venice AI. Watch two AI characters engage in dynamic conversations with an elegant, mobile-first interface.

![Venice Chatroom](public/venice-keys-black.png)

## Features ✨

- **AI Character Conversations**: Input Venice AI character URLs to simulate realistic conversations
- **Mobile-First Design**: Responsive interface optimized for all screen sizes
- **Real-time Chat Interface**: Modern chat bubbles with alternating message layout
- **Venice Branding**: Custom color palette and typography matching Venice AI design
- **Auto-scroll**: Messages automatically scroll to the latest conversation
- **Thinking Indicators**: Visual feedback when characters are "thinking"
- **Topic-based Conversations**: Set conversation topics to guide the discussion

## Tech Stack 🛠️

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom Venice color palette
- **Icons**: Lucide React
- **Fonts**: Markazi Text & Mea Culpa (Google Fonts)

## Getting Started 🚀

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sidharth-n/venice-chatroom.git
cd venice-chatroom
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage 📖

1. **Landing Page**: Click "Start Chatroom" to begin
2. **Setup Characters**: 
   - Enter two Venice AI character URLs
   - Set a conversation topic
   - Click "Start Conversation"
3. **Chat Interface**: 
   - Watch characters alternate messages
   - Click "Next Message" to continue the conversation
   - Messages auto-scroll to the latest

## Project Structure 📁

```
venice-chatroom/
├── public/
│   ├── venice-keys-black.png    # Venice logo
│   ├── venice-keys-red.png      # Alternative logo
│   └── venice-keys-white.png    # Alternative logo
├── src/
│   ├── App.tsx                  # Main application component
│   ├── index.css               # Global styles & Tailwind imports
│   ├── main.tsx                # Application entry point
│   └── vite-env.d.ts           # Vite type definitions
├── tailwind.config.js          # Tailwind configuration with Venice colors
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies and scripts
```

## Venice Color Palette 🎨

The application uses a custom Venice color palette:

- **Primary**: `venice-bright-red` (#ea463b)
- **Background**: `venice-cream` (#f3f0e7)
- **Text**: `venice-olive-brown` (#3f3a26)
- **Accents**: `venice-stone` (#b1a993)
- **Surface**: `venice-white` (#fdfcf8)

## Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Current Limitations ⚠️

- Uses dummy responses instead of real Venice AI API integration
- No conversation persistence
- Simple state management (no external state library)
- No real-time messaging capabilities

## Future Enhancements 🔮

- [ ] Integrate with Venice AI API for real character responses
- [ ] Add conversation history and persistence
- [ ] Implement real-time messaging
- [ ] Add character avatar support
- [ ] Export conversation transcripts
- [ ] Multiple conversation rooms

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Venice AI for the inspiration and branding
- React and Vite communities for excellent tooling
- TailwindCSS for the utility-first CSS framework
- Lucide React for beautiful icons

---

Built with ❤️ for the Venice AI community
