# My Fintech Dashboard

Hệ thống quản lý tài chính và kho vay thông minh với tích hợp Google Sheets và Telegram.

## 🚀 Tính năng

- ✅ Dashboard tổng quan với thống kê
- ✅ Quản lý kho vay (CRUD)
- ✅ Lên lịch đăng bài
- ✅ Tích hợp Google Sheets API
- ✅ Thông báo Telegram
- ✅ Giao diện responsive, mobile-first
- ✅ Dark mode support

## 🛠️ Công nghệ sử dụng

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component Library
- **React Router** - Routing
- **Google Sheets API** - Data Storage
- **Telegram Bot API** - Notifications

## 📦 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Chỉnh sửa file `.env` và điền các thông tin:

```env
# Google Sheets API
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-google-api-key-here
VITE_SPREADSHEET_ID=your-spreadsheet-id-here

# Telegram Bot
VITE_TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
VITE_TELEGRAM_CHAT_ID=your-telegram-chat-id-here
```

### 3. Cấu hình Google Sheets

1. Tạo project tại [Google Cloud Console](https://console.cloud.google.com/)
2. Bật Google Sheets API
3. Tạo OAuth 2.0 Client ID (Web application)
4. Tạo API Key
5. Tạo Google Sheet với các sheet: `Offers`, `Schedule`, `Analytics`

### 4. Cấu hình Telegram Bot

1. Tạo bot mới với [@BotFather](https://t.me/botfather)
2. Lấy Bot Token
3. Lấy Chat ID của bạn

## 🚀 Chạy ứng dụng

### Development

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

### Build Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Cấu trúc thư mục

```
my-fintech-dashboard/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.tsx
│   │   ├── Layout.tsx
│   │   └── LoginBtn.tsx
│   ├── config/
│   │   └── constants.ts
│   ├── lib/
│   │   ├── google.ts
│   │   ├── telegram.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Offers.tsx
│   │   └── Scheduler.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 📝 Hướng dẫn sử dụng

### 1. Đăng nhập

- Nhấn nút "Đăng nhập Google" ở sidebar
- Cấp quyền truy cập Google Sheets

### 2. Quản lý kho vay

- Vào trang "Kho vay"
- Nhấn "Thêm kho vay" để thêm mới
- Điền thông tin: Tên, Số tiền, Lãi suất, Kỳ hạn
- Hệ thống tự động gửi thông báo qua Telegram

### 3. Lên lịch đăng bài

- Vào trang "Lên lịch"
- Tính năng đang được phát triển

## 🔧 Tùy chỉnh

### Thêm sheet mới

Chỉnh sửa `src/config/constants.ts`:

```typescript
export const SHEET_NAMES = {
  OFFERS: 'Offers',
  SCHEDULE: 'Schedule',
  ANALYTICS: 'Analytics',
  YOUR_NEW_SHEET: 'YourSheetName',
};
```

### Thêm trang mới

1. Tạo file trong `src/pages/YourPage.tsx`
2. Thêm route trong `src/App.tsx`
3. Thêm menu item trong `src/components/Layout.tsx`

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📧 Liên hệ

Nếu có thắc mắc, vui lòng tạo issue trên GitHub.
