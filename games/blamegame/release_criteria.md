# Blame Game – Release Criteria ("Playable Beta")

## 🎯 Functional Criteria (Must Work)

### 🎲 Game Mechanics
- [x] Question rotation works (random, no repetitions)
- [x] Questions are fully visible and clickable
- [x] Game can be started and ended without error messages
- [x] Progress bar shows progress correctly
- [x] LocalStorage saves played questions
- [x] Reset function specifically clears LocalStorage

### 👥 Player Modes
- [x] Classic Mode works completely
- [x] NameBlame Mode can be activated, with name input + selection
- [x] Selection of names in questions works without errors
- [x] Blame evaluation appears in the summary

### 🔊 Sound & Feedback
- [x] Sound Toggle works
- [x] Sound effects play correctly during events (question, start, end)
- [x] Volume control or mute option available

### 💾 PWA & Offline Capability
- [x] Manifest & Icons present
- [x] Service Worker activated
- [ ] App installable as PWA (Progressive Web App)
- [ ] App works offline (at least game start + questions visible)

---

## 💡 Non-Functional Criteria (Must Feel Good)

### ⚡ Performance & Stability
- [x] No noticeable loading times (>300ms)
- [x] No UI blockers or layout shifts
- [x] Animations not disruptive (smooth transitions)

### 📱 Usability & UX
- [x] App is fully usable on smartphones
- [x] UI is "Pass-the-Phone" friendly (large buttons, clear roles)
- [x] Text on cards never cut off (even with long questions)
- [x] App is intuitive to use on first opening
- [x] A round feels complete (animation / end screen)

---

## ✅ Release Conclusion

> **The game is ready for public testing once a complete round can be played without technical or experiential interruptions.**  
> **All interactions must be stable, responsive, and understandable – especially in a group context.**

