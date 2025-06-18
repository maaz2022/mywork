# Reseller Portal

A modern reseller portal built with Next.js, Firebase, and shadcn/ui.

## Features

- 🎨 Modern, responsive design
- 🔐 Firebase Authentication
- 📱 Mobile-friendly interface
- 🎯 Free and Premium membership options
- 📊 User dashboards
- 📝 Form validation
- 🔒 Secure authentication

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase (Authentication & Firestore)
- Zod (Form validation)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd reseller-portal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── components/     # Reusable components
│   ├── dashboard/      # Free user dashboard
│   ├── premium-dashboard/  # Premium user dashboard
│   ├── signup/        # Signup page
│   └── page.tsx       # Landing page
├── lib/
│   ├── firebase.ts    # Firebase configuration
│   └── utils.ts       # Utility functions
└── public/            # Static assets
```

## Features

### Landing Page
- Modern hero section
- Benefits showcase
- Clear call-to-action buttons

### Signup System
- Email/password authentication
- Form validation
- Free/Premium membership options
- User profile creation

### Dashboards
- Free user dashboard
- Premium user dashboard with additional features
- Resource downloads
- Quick actions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
