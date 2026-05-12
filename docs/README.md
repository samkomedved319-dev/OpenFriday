# Open Friday - GitHub Pages Deployment

This project can be hosted on GitHub Pages!

## 🚀 Quick Deploy

1. **Go to your repository on GitHub**
2. **Settings → Pages**
3. **Source**: Select `main` branch and `/docs` or `/webui` folder
4. **Save** and wait for deployment

## 📁 Files

- `index.html` - Landing page
- `login.html` - Dashboard (login/signup/API config)
- `styles.css` - Styling
- `script.js` - JavaScript

## ⚠️ Note

This is the **web interface only**. To use Open Friday in your terminal, you need:
- Node.js installed
- Run `npm link` to use the `openfriday` command

The web dashboard works independently and uses localStorage for data.

## 🌐 Live Demo

After deploying, your dashboard will be at:
```
https://yourusername.github.io/openfriday/login.html
```

## 📝 Features

- Landing page with features & pricing
- Login/Signup system
- API configuration (8 providers)
- Fully static - no server needed!