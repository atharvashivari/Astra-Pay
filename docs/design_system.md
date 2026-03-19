# Astra-Pay Design System

This document outlines the visual identity and design tokens for the Astra-Pay frontend, inspired by the modern digital banking aesthetics from [Bogdan Falin's QClay design](https://dribbble.com/shots/24322279-Digital-Banking-Landing-Page-Website).

## 1. Design Principles
- **Clarity & Focus**: Minimalist interface with maximum whitespace to reduce cognitive load.
- **Modularity**: "Bento Box" grid system where every feature lives in its own rounded container.
- **Professionalism**: Solid black and white base with a vibrant accent for a high-end fintech feel.

## 2. Color Palette

| Usage | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary BG** | `#F7F7F7` | Soft off-white background for the entire application. |
| **Card BG** | `#FFFFFF` | Pure white background for content containers. |
| **Secondary BG**| `#EFEFEF` | Subtle gray for inputs, toggles, and inactive states. |
| **Text Primary** | `#000000` | Headings, primary titles, and high-contrast text. |
| **Text Secondary**| `#666666` | Body copy, labels, and helper text. |
| **Accent** | `#FF4D8D` | Vibrant Pink used for highlights, active icons, and CTA emphasis. |

## 3. Typography
- **Primary Font**: `Inter`, `Satoshi`, or `Manrope` (Sans-serif).
- **Scale**:
    - **Display**: 48px - 64px (Bold) - Hero sections.
    - **Header 1**: 32px (Bold) - Page titles.
    - **Header 2**: 24px (Semi-bold) - Section titles.
    - **Body**: 16px (Regular) - Standard reading text.
    - **Small**: 14px (Medium) - Captions and labels.

## 4. Components & Layout

### Cards (The "Bento" Unit)
- **Border Radius**: `24px` to `32px`.
- **Shadow**: `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05)`.
- **Spacing**: Internal padding of `20px` to `40px`.

### Buttons
- **Primary**: Pill-shaped (fully rounded), Black background, White text.
- **Secondary**: Pill-shaped, White background, Thin `#EFEFEF` border, Black text.

### Interactive Elements
- **Toggles**: Capsule-shaped with a sliding active indicator.
- **Inputs**: High border-radius, subtle gray background (`#EFEFEF`), focused state with accent border.

## 5. Visual Effects
- **Bento Grid**: Modular layout (use CSS Grid/Flexbox) with consistent gaps (e.g., `24px`).
- **Interactive States**: Subtle elevation on hover (`scale(1.02)`) and shadow deepening.
- **Iconography**: Clean, thin-line icons using the primary black or accent magenta.

---
*Inspired by: Digital Banking Landing Page (QClay Design)*
