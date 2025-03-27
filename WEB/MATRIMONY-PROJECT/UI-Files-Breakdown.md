# UI Files Breakdown

## Main Layout & Page Files

| **File**               | **Purpose**                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `app/layout.tsx`       | Defines the **base layout** (HTML structure).                   |
| `app/page.tsx`         | **Home Page** (imports `Header`, `Hero`, `Features`, `Footer`). |
| `app/profile/page.tsx` | **Profile Page** where users fill in their details.             |

## UI Components

| **Component**                    | **Purpose**                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `app/components/Header.tsx`      | Top **navigation bar** (menu, branding).                                                        |
| `app/components/Hero.tsx`        | **Hero section** (welcome banner).                                                              |
| `app/components/Features.tsx`    | Displays **key app features**.                                                                  |
| `app/components/Footer.tsx`      | **Footer** with copyright info.                                                                 |
| `app/components/ProfileForm.tsx` | **Profile Form** (includes full name, age, gender, bio, interests, and profile picture upload). |

## Styles & Configuration

| **File**             | **Purpose**                                               |
| -------------------- | --------------------------------------------------------- |
| `styles/globals.css` | **Tailwind CSS global styles.**                           |
| `tailwind.config.js` | Tailwind **configuration file**.                          |
| `postcss.config.js`  | Required for **PostCSS processing** in Tailwind.          |
| `package.json`       | Defines **dependencies & scripts** (`npm run dev`, etc.). |
