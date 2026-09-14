# Society Maintenance Portal 

A full-stack web application designed to streamline communication, maintenance requests, and announcements between housing society residents and management.

## Features

**For Residents:**
* **Raise Complaints:** Submit maintenance tickets (Plumbing, Electrical, etc.) with priority levels.
* **Photo Evidence:** Securely upload images of the issue using Cloudinary.
* **Track Status:** Monitor whether a complaint is Open, In Progress, or Resolved.
* **Notice Board:** View society announcements and mark them as read/unread to keep the dashboard organized.

**For Society Admins/Managers:**
* **Analytics Dashboard:** View real-time metrics on total complaints, active issues, and overdue tickets.
* **Ticket Management:** Update the status of resident complaints seamlessly.
* **Broadcast Notices:** Publish announcements to all residents and flag important ones as "Urgent" (highlighted in red).
* **Maintain Records:** Delete outdated notices to keep the system clean.

## Tech Stack

* **Frontend:** React.js, TypeScript, Tailwind CSS, Lucide React Icons
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (hosted on Neon)
* **ORM:** Prisma
* **Image Hosting:** Cloudinary

## Local Installation & Setup

To run this project locally on your machine, follow these steps:

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/SWAMYNATHANV/society-maintenance-app.git
\`\`\`

**2. Setup the Backend**
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` folder and add:
\`\`\`env
DATABASE_URL="your_neon_postgres_url_here"
JWT_SECRET="your_secret_key"
PORT=5000
\`\`\`
Sync the database and start the server:
\`\`\`bash
npx prisma db push
npx prisma generate
npm run dev
\`\`\`

**3. Setup the Frontend**
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
\`\`\`
Start the React development server:
\`\`\`bash
npm run dev
\`\`\`

## 🔮 Future Enhancements
* Automated email notifications for status updates (via Nodemailer).
* Direct chat/comment threads on individual complaint tickets.
