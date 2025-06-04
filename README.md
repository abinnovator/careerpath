# CareerPath - AI-Powered Interview Practice & Notes

## Overview

CareerPath is a web application designed to help students and job seekers ace their interviews. Leveraging the power of AI and voice agents (powered by VAPI.ai), CareerPath offers realistic mock interviews, intelligent feedback, a smart note-taking system, and interactive AI-driven quizzes to enhance learning and preparation.

This project was built as part of the VAPI Build Challenge, aiming to showcase the innovative use of voice AI in an educational context.

## Key Features

- **AI-Powered Mock Interviews:**
  - Simulate real interview scenarios with AI-driven interviewers.
  - Voice interaction powered by VAPI.ai for a more immersive experience.
  - Generation of diverse interview questions across various domains.
- **Intelligent Feedback:**
  - Receive instant feedback on your interview performance, highlighting strengths and areas for improvement.
  - Analysis powered by AI to provide actionable insights.
- **Smart Note-Taking System:**
  - Dedicated notes page for users to record key learnings and reflections.
  - AI-Assisted Note Improvement:
    - Trigger AI (powered by VAPI.ai) via voice commands or shortcuts to improve writing, summarize content, elaborate on points, and suggest organizational structures.
    - Voice input for dictating notes.
    - AI voice output for suggestions.
- **Interactive AI Quizzing:**
  - Generate personalized quizzes based on the content of user notes.
  - Voice-activated quiz interaction:
    - AI voice delivery of questions.
    - Voice input for answering.
    - AI voice feedback and scoring.
- **Calendar Integration:**
  - A calendar view to help users schedule and track their interview practice sessions and other career-related events.
  - Ability to add and view events on specific dates.
- **User Authentication:** Secure user accounts to save interview history, notes, and preferences.
- **Responsive Design:** Accessible and usable on various devices.

## Documentation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/abinnovator/careerpath
    cd career-path
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install or pnpm install
    ```

3.  **Configure Firebase:**

    - Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    - Enable Firestore as your database.
    - Obtain your Firebase project configuration object.
    - Create a `.env.local` file in your project root and add your Firebase configuration:
      ```
      NEXT_PUBLIC_FIREBASE_API_KEY=[YOUR_API_KEY]
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[YOUR_AUTH_DOMAIN]
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=[YOUR_PROJECT_ID]
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[YOUR_STORAGE_BUCKET]
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[YOUR_MESSAGING_SENDER_ID]
      NEXT_PUBLIC_FIREBASE_APP_ID=[YOUR_APP_ID]
      ```

4.  **Configure VAPI.ai:**

    - Sign up for an account on [VAPI.ai](https://vapi.ai/).
    - Obtain your VAPI API key.
    - Add your VAPI API key to your `.env.local` file:
      ```
      VAPI_API_KEY=[YOUR_VAPI_API_KEY]
      ```

5.  **Run the development server:**

    ```bash
    npm run dev  # or yarn dev or pnpm dev
    ```

    Open your browser at `http://localhost:3000`.

## Environment Variables

      NEXT_PUBLIC_FIREBASE_API_KEY=[YOUR_API_KEY]
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[YOUR_AUTH_DOMAIN]
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=[YOUR_PROJECT_ID]
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[YOUR_STORAGE_BUCKET]
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[YOUR_MESSAGING_SENDER_ID]
      NEXT_PUBLIC_FIREBASE_APP_ID=[YOUR_APP_ID]
      VAPI_API_KEY=[YOUR_VAPI_API_KEY]

## License

GNU General Public License v3.0

## Badges

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)

## Author

Aadit Bhambri
Portfolio - https://aadit-bhambri.vercel.app

## Demo

https://youtu.be/b-b22ZWNTfE
