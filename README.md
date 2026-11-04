# Frame - Creative Studio Marketplace

**Frame** is a full-stack creative studio marketplace where users can discover, explore, list, and book professional creative spaces for photography, videography, podcasts, music production, and workshops.

The platform connects studio owners with creators through a modern, responsive interface, secure authentication, studio management, and a booking system.

### Live Website

**Live URL:** https://frame-client.vercel.app

**Client GitHub Repository:** https://github.com/say33eed/frame-client

**Server GitHub Repository:** https://github.com/say33eed/frame-server

**Backend API:** https://frame-server-35c7.onrender.com

---

## Key Features

1. **Studio Discovery:** Explore creative studio listings across different categories and view detailed studio information.

2. **Interactive Homepage:** A modern homepage featuring a Swiper.js hero slider, featured studios, and category-based navigation.

3. **Secure Authentication:** Email/password registration and login, along with Google authentication using Better Auth.

4. **Studio Management:** Authenticated users can add, edit, and delete their own studio listings.


5. **Studio Booking System:** Users can select booking dates and time slots, submit reservations, and manage their bookings.

6. **Booking Conflict Prevention:** Server-side validation prevents overlapping confirmed bookings for the same studio.

7. **My Listings Dashboard:** Studio owners can view and manage their published studios.

8. **My Bookings:** Users can review their bookings and cancel eligible reservations.

9. **Responsive Design:** Optimized layouts for mobile phones, tablets, and desktop screens.

10. **Dark and Light Modes:** Theme support for a comfortable browsing experience.



---

## Technology Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui and Base UI
- Lucide React
- Swiper.js
- Sonner

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- MongoDB Node.js Driver
- Better Auth

### Additional Services

- Google OAuth — social authentication
- imgbb — studio image hosting
- Vercel — frontend deployment
- Render — backend deployment
- GitHub — source code management

---

## Installation and Local Setup

### Prerequisites

Before running the application, make sure you have:

- Node.js and npm installed
- Git installed
- MongoDB Atlas database access
- Required environment variables
- Client and server source code

### 1. Clone the Frontend Repository

```bash
git clone https://github.com/say33eed/frame-client.git
cd frame-client
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Frontend Environment Variables

Create a `.env.local` file in the frontend project root.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

Replace the example values with your own configuration.

If Google authentication is not configured locally, set:

```env
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=false
```

**Important:** Never commit real API keys, passwords, or secret environment variables to GitHub.

### 4. Start the Frontend Development Server

```bash
npm run dev
```

Open the application in your browser:

http://localhost:3000

### 5. Set Up the Backend

Clone your backend repository:

```bash
git clone https://github.com/say33eed/frame-server
cd frame-server
npm install
```

Create a `.env` file in the backend directory and configure the required environment variables using the server project's environment example.

These include the MongoDB connection, authentication settings, and permitted frontend origin.

Start the backend:

```bash
npm run dev
```

The local backend normally runs at:

http://localhost:5000

### 6. Verify the Frontend

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

---

## Authentication and Authorization

Frame uses **Better Auth** for user authentication.

Supported authentication methods:

- Email and password registration
- Email and password login
- Google OAuth login
- Session-based authentication
- Protected studio management routes

Only authenticated users can create studio listings and manage their bookings.

Studio editing and deletion are restricted to the owner of the corresponding listing.

---

## Studio Management

Studio owners can:

- Create a new studio listing
- Enter studio title and category
- Set hourly rental prices
- Configure security deposits
- Set maximum guest capacity
- Provide studio location and description
- Select available amenities
- Upload and manage studio photos
- Select the primary cover image
- Update existing listings
- Delete their own listings

Studio information is stored in MongoDB.

---

## Image Gallery Features

The studio image manager supports:

- Uploading multiple images
- Adding images using URLs
- Selecting a cover image
- Removing individual images
- Automatically selecting another cover image when the current cover is removed
- Previewing images on mobile, tablet, and desktop
- Managing previously saved images while editing

A maximum of **10 images per studio** is supported.

Removing an image from a studio listing updates the saved gallery after the form is submitted. It does not automatically delete the original file from imgbb.

---

## Studio Booking System

The booking system allows users to:

- View studio availability
- Select a booking date
- Choose booking times
- Submit a reservation
- View booking information
- Manage existing bookings
- Cancel eligible reservations

The backend validates booking requests and prevents overlapping confirmed reservations for the same studio.

---

## Responsive Design

Frame is designed for different screen sizes.

- **Mobile:** Responsive navigation, forms, image previews, and gallery grids
- **Tablet:** Adapted spacing and multi-column layouts
- **Desktop:** Full-width content layouts and enhanced browsing experience

The interface also supports dark and light themes.

---

## Deployment

The application is deployed using:

| Service | Purpose |
|---|---|
| Vercel | Next.js frontend |
| Render | Express backend |
| MongoDB Atlas | Cloud database |
| imgbb | Studio image hosting |
| GitHub | Source code repositories |

**Frontend:** https://frame-client.vercel.app

**Backend:** https://frame-server-35c7.onrender.com

---

## Examiner Test Credentials

The following section is intended for assignment evaluation.

**Login URL:** https://frame-client.vercel.app/login

**Test Email:** sayed.discend@gmail.com

**Test Password:** aEDMtwHw4w6tvSV

---

## Project Highlights

Frame demonstrates:

- Full-stack application development
- REST API integration
- Database CRUD operations
- User authentication and authorization
- Google OAuth integration
- File uploading and image management
- Booking management and validation
- Responsive UI development
- Production deployment

---

