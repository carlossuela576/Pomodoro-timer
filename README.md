# Pomodoro Timer

A sleek, lightweight, and responsive Pomodoro Timer web application designed to boost productivity, manage focused work intervals, and track break periods efficiently without unnecessary framework overhead.

---

## Features

- **Customizable Intervals:** Easily switch between Work sessions, Short Breaks, and Long Breaks.
- **Interactive Controls:** Intuitive Start, Pause, and Reset functionality.
- **Audio & Visual Alerts:** Clear notifications when a session completes so you never miss a transition.
- **Minimalist Interface:** Clean, distraction-free design focused purely on productivity.
- **Responsive Design:** Optimized for seamless performance across desktop, tablet, and mobile browsers.

---

## Tech Stack

- **Markup:** HTML5 (index.html) and React 19 JSX/TSX components with semantic HTML and ARIA accessibility attributes (tablist, tab, progressbar, alert, fieldset).HTML5 (index.html) and React 19 JSX/TSX components with semantic HTML and ARIA accessibility attributes (tablist, tab, progressbar, alert, fieldset).
- **Styling:** Tailwind CSS v4 (@tailwindcss/vite), global base CSS rules in src/index.css (for focus-visible rings and prefers-reduced-motion), Plus Jakarta Sans via Google Fonts, and lucide-react for icons.
- **Logic:** TypeScript and React 19 hooks (useState, useEffect, useRef, useCallback, useId), bundled with Vite (vite and @vitejs/plugin-react), using timestamp-based setInterval timing, localStorage for saving session settings, and the Web Audio API + Web Notifications API for session-end alerts.

---

## Getting Started

### Prerequisites
To run this project locally, all you need is a modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Installation & Running
1. **Clone the repository:**
   ```bash
   git clone https://github.com/carlossuela576/Pomodoro-timer.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd Pomodoro-timer
   ```
3. **Open the application:**
   Double-click `index.html` or open it directly in your preferred web browser. Alternatively, use a local live server extension (such as Live Server in VS Code) for hot reloading.

---

## Project Structure

```text
Pomodoro-timer/
│
├── index.html       # Main application markup
├── style.css        # Stylesheet and layout design
├── script.js        # Timer logic, state management, and event listeners
└── README.md        # Project documentation
```

---

## Usage

1. Select your desired mode (**Pomodoro**, **Short Break**, or **Long Break**).
2. Click **Start** to begin the countdown timer.
3. Use **Pause** if you need to step away temporarily, or **Reset** to restart the current interval.
4. Stay focused until the timer alerts you to take a well-deserved break!

---

## License

This project is open-source and available under the [MIT License](LICENSE).
