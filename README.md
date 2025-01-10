# 💬 Anonymous Chat Application

> A secure, full-stack anonymous message board system built with modern web technologies.

## 🚀 Technical Stack

### 🔧 Backend
- 🟢 **Runtime**: Node.js
- ⚡ **Framework**: Express.js
- 🗄️ **Database**: MongoDB
- 🔑 **Authentication**: Password-based deletion system
- 🛡️ **Security Features**:
  - 🔒 XSS protection
  - 🌐 CORS configuration
  - 🛑 Security headers
  - ✔️ Input validation
  - ⚡ Rate limiting
  - 🕶️ No session tracking

### 🎨 Frontend
- 📱 **Framework**: jQuery
- 🎯 **UI**: Bootstrap 5
- 💅 **Icons**: Bootstrap Icons
- 🔔 **Notifications**: Toast components
- 📐 **Design**: Mobile-first approach

## 🔐 Security Features

- 🎭 Anonymous posting
- 🔒 Secure deletion passwords
- 🚫 No IP logging
- 🍪 No cookies
- 🛡️ Content moderation
- 🧹 Input sanitization
- 🔰 Vulnerability protection
- 📡 Secure headers

## ⚙️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/anonymous-chat.git
cd anonymous-chat
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
DB=mongodb://your-connection-string
PORT=3000
NODE_ENV=production
```

## 🧪 Testing

```bash
# 🔬 Run all tests
npm test

# 🔍 Run specific suites
npm run test:unit
npm run test:functional

# 📊 Coverage report
npm run test:coverage
```

## 💻 Development

```bash
# 🏃‍♂️ Start dev server
npm run dev

# 🔍 Run linting
npm run lint

# ✅ Type checking
npm run type-check
```

## 🚀 Deployment

### 🌍 Standard Deployment
```bash
npm run build
npm start
```

### 🐳 Docker Deployment
```bash
docker build -t anonymous-chat .
docker run -p 3000:3000 anonymous-chat
```

## 📚 API Reference

### 📝 Threads
- `POST /api/threads/{board}` 📤 Create thread
- `GET /api/threads/{board}` 📥 Get threads
- `DELETE /api/threads/{board}` 🗑️ Delete thread
- `PUT /api/threads/{board}` ⚠️ Report thread

### 💭 Replies
- `POST /api/replies/{board}` 📤 Add reply
- `GET /api/replies/{board}` 📥 Get replies
- `DELETE /api/replies/{board}` 🗑️ Delete reply
- `PUT /api/replies/{board}` ⚠️ Report reply

## 🤝 Contributing

1. 🔀 Fork the repo
2. 🌿 Create feature branch
3. 💾 Commit changes
4. 🔋 Push to branch
5. ✨ Create Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) file

## 📊 Stats

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

## 🌟 Features

- ⚡ Lightning fast responses
- 📱 Mobile responsive
- 🔒 Secure by default
- 🎯 Simple & intuitive UI
- 🔧 Easy to customize
- 📦 Docker ready


