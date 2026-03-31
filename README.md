# Ritik.dev — A Premium Modern Blog Platform

[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://ritikblog.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

**Ritik.dev** is a high-performance, feature-rich blog application designed with a focus on premium user experience, security, and developer-centric storytelling. Built with the latest Next.js 16 (App Router), it provides a seamless and interactive environment for both readers and creators.

---

## 🚀 Key Features

### 🔐 Advanced Authentication & Security
- **NextAuth.js v5 (Beta)**: Robust authentication using both Google OAuth and Email/Password credentials.
- **Secure Email OTP**: Two-step signup process utilizing **Nodemailer** for SMTP email dispatch to prevent fake registrations.
- **Dynamic Ban System**: A multi-layered security layer that restricts misbehaving users with a global **Banned User Overlay** and API-level middleware protection.

### ✍️ Rich Authoring Experience
- **Medium-Style Editor**: Powerful rich text editing powered by **Tiptap**, supporting image uploads, link embedding, and dynamic placeholders.
- **Metadata Management**: Automated read-time calculation and tag management for better discoverability.
- **Image Hosting**: Integrated with **Cloudinary** for lightning-fast image processing and delivery.

### 🌐 Social & Interactive Feed
- **Interactive Engagements**: Real-time Like, Save, and Comment features for every post.
- **Follower System**: Personalized feeds allowing users to stay updated with their favorite creators.
- **Public Profiles**: Beautifully curated author pages displaying bios, social links (GitHub, LinkedIn, Twitter), and published articles.
- **Smart Filtering**: Native MongoDB regex search for tags and categories.

### 🎨 Premium UI/UX
- **Modern Aesthetics**: Built with **Tailwind CSS** and **Shadcn UI** for a sleek, glassmorphic look.
- **Micro-Animations**: Smooth transitions and interactive elements powered by **Framer Motion**.
- **Dark Mode Support**: Native theme switching with **Next Themes** for a comfortable reading experience.

---

## 🛠️ Technology Stack

| Domain | Technology Used |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS + Shadcn/UI |
| **Database** | MongoDB + Mongoose |
| **Authentication** | Auth.js (NextAuth v5) |
| **Rich Text** | Tiptap Editor |
| **FileUploads** | Cloudinary API |
| **Emails** | Nodemailer (SMTP) |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |

---

## 🧠 What I Learned from this Project

Building **Ritik.dev** was a journey into deep full-stack engineering. Key takeaways include:

1.  **Advanced Middleware Patterns**: Implementing global security layers in Next.js to handle user bans and session validation at the edge.
2.  **Schema Architecture**: Designing efficient Mongoose schemas for complex relationships like follower counts, nested comments, and post likes.
3.  **Modern Auth Flows**: Mastering the Auth.js v5 beta ecosystem and implementing custom OTP verification to harden account security.
4.  **Performance Optimization**: Leveraging Next.js Server Components to minimize client-side JavaScript while maintaining high interactivity.
5.  **Clean Code Practices**: Managing a large codebase with modular components and service-oriented API routes.

---

## 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ritik-kumar/blog-app.git
    cd blog-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Create a `.env.local` file and add the following:
    ```env
    MONGODB_URI=your_mongodb_uri
    NEXTAUTH_SECRET=your_secret
    GOOGLE_ID=your_google_id
    GOOGLE_SECRET=your_google_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    EMAIL_USER=your_smtp_email
    EMAIL_PASS=your_smtp_password
    GEMINI_API_KEY=your_ai_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by [Ritik Kumar](https://github.com/ritik-kumar660)
