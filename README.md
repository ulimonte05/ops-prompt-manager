# Prompt Orchestrator UI

A modern, user-friendly interface for managing the Prompt Orchestrator API. Built with Next.js, Clerk authentication, and shadcn/ui components.

## 🚀 Features

- ✅ **Templates Management**: Create, edit, and delete reusable prompt templates with variables
- ✅ **Companies Management**: Manage organizations and their configurations
- ✅ **Prompts Management**: Create prompts manually or from templates, with versioning and conditional content
- ✅ **Email Allowlist**: Secure access control using Clerk authentication with email allowlist
- ✅ **Modern UI**: Beautiful, responsive interface built with shadcn/ui
- ✅ **Real-time Updates**: Instant feedback and error handling

## 📋 Prerequisites

- Node.js 18+
- Prompt Orchestrator API running (default: http://localhost:8081)
- Clerk account for authentication

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Allowed emails (comma-separated)
EMAILS=user1@example.com,user2@example.com,admin@example.com

# Prompt Orchestrator API (optional, defaults to http://localhost:8081)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

### 3. Get Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use an existing one
3. Copy your Publishable Key and Secret Key
4. Add them to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Getting Started

1. **Sign In**: Use an email address that's in your `EMAILS` environment variable
2. **Dashboard**: View overview of templates, companies, and active prompts
3. **Templates**: Create reusable templates with variables like `{{company_name}}`
4. **Companies**: Add organizations that will use the prompt system
5. **Prompts**: Create prompts for companies, either manually or from templates

### Creating a Template

1. Navigate to **Templates** in the sidebar
2. Click **Create Template**
3. Fill in:
   - Name and description
   - Prompt content with variables (e.g., `{{variable_name}}`)
   - Add variables that will be replaced when creating prompts
4. Click **Create**

### Creating a Company

1. Navigate to **Companies** in the sidebar
2. Click **Create Company**
3. Fill in:
   - Name and Company ID (must be unique)
   - Optional description and base template
4. Click **Create**

### Creating a Prompt

You can create prompts in two ways:

**From Template:**
1. Navigate to **Prompts**
2. Click **Create Prompt**
3. Check "Create from Template"
4. Select a company and template
5. Fill in template variables
6. Click **Create**

**Manual:**
1. Navigate to **Prompts**
2. Click **Create Prompt**
3. Select a company
4. Write the prompt content
5. Optionally add variables and conditions
6. Set as active if needed
7. Click **Create**

### Conditions

Prompts support conditional content that's added based on context:

- **Key**: The context key (e.g., "channel")
- **Value**: The expected value (e.g., "whatsapp")
- **Content**: The content to add when the condition matches

Example: When `channel=whatsapp`, add "Use a casual tone and emojis."

## 🏗️ Project Structure

```
orchestation/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── templates/             # Templates management
│   ├── companies/             # Companies management
│   ├── prompts/               # Prompts management
│   └── sign-in/               # Authentication
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── sidebar.tsx            # Navigation sidebar
│   ├── app-layout.tsx          # Main layout wrapper
│   ├── template-dialog.tsx     # Template create/edit dialog
│   ├── company-dialog.tsx      # Company create/edit dialog
│   ├── prompt-dialog.tsx       # Prompt create/edit dialog
│   └── prompt-view-dialog.tsx # Prompt view dialog
└── lib/
    ├── api-client.ts          # API client utilities
    └── utils.ts               # Utility functions
```

## 🔒 Security

- **Authentication**: Clerk handles user authentication
- **Email Allowlist**: Only emails in the `EMAILS` environment variable can access the app
- **API Security**: The Prompt Orchestrator API should be secured separately

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Adding New Features

1. API client methods are in `lib/api-client.ts`
2. Pages are in `app/` directory
3. Reusable components are in `components/`
4. Use shadcn/ui components for consistent styling

## 📝 Notes

- The API base URL defaults to `http://localhost:8081` but can be configured via `NEXT_PUBLIC_API_BASE_URL`
- All API calls are made from the client side
- Error handling is built into all API operations
- The UI provides real-time feedback for all operations

## 🐛 Troubleshooting

**Can't sign in:**
- Check that your email is in the `EMAILS` environment variable
- Verify Clerk keys are correct

**API errors:**
- Ensure the Prompt Orchestrator API is running
- Check the API base URL in environment variables
- Verify network connectivity

**Components not rendering:**
- Run `npm install` to ensure all dependencies are installed
- Check browser console for errors

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Prompt Orchestrator API Docs](./PROMPT_MANAGEMENT_API.md)
