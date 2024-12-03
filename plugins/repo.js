import { bot } from '../lib/plugins.js';

bot(
  {
    pattern: 'repo',
    isPublic: true,
    desc: 'Sends bot introduction, social links, GitHub repository link, and developer information.',
    type: 'utility',
  },
  async (message) => {
    const response = `
🌟 **Welcome to Xstro Bot!** 🌟
Hello! I am **Xstro**, your multi-device friendly bot, here to assist you with various tasks, enhance your group experience, and keep you entertained! 🚀

---

🎯 **What I Can Do for You:**
> - Automate your daily tasks 🛠️
> - Manage your groups efficiently 📋
> - Provide fun interactions and utilities 🎉
> - Stay updated with cool features! 🌐

---

🔗 **GitHub Repository:**
> **Explore My Source Code:** *https://github.com/AstroX11/Xstro*
> Contribute, report issues, or suggest features to make me even better! 💻

---

👨‍💻 **Meet the Developers:**
- 👾 **Astro** from Negira *(Lead Developer)* — The mastermind behind Xstro's robust features.
- 🤝 **Mr. Wasi** from Pakistan *(Co-Developer)* — Ensures everything runs smoothly and efficiently.

---

💡 **How You Can Help:**
> Star the repository ⭐, report bugs 🐛, or share your feature ideas 💡.

🌐 **Let’s Make Xstro Even Better Together!**

> _Powered by **Xstro Multi-Device** — Built for YOU! 💜_
    `;


    try {
      await message.sendReply(response);
      console.log(' Repo information sent successfully.');
    } catch (error) {
      console.error(' Failed to send repo information:', error);
    }
  }
);
