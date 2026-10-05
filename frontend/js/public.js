const slides=[...document.querySelectorAll('.emi-slide')];
const dots=[...document.querySelectorAll('.emi-dots button')];
if(slides.length){let i=0;const show=n=>{slides.forEach((s,k)=>s.classList.toggle('active',k===n));dots.forEach((d,k)=>d.classList.toggle('active',k===n));i=n};dots.forEach((d,k)=>d.addEventListener('click',()=>show(k)));setInterval(()=>show((i+1)%slides.length),5000)}
if('serviceWorker' in navigator && document.body.classList.contains('parkia-public')) navigator.serviceWorker.register('/sw.js').catch(()=>{});
