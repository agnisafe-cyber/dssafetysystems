React.createElement("h1",{className:"hero-title"},
  React.createElement("span",{className:"hero-line"},"Industrial Fire Safety,"),
  React.createElement("span",{className:"hero-line"},"Engineered ",React.createElement("span",{className:"hero-red"},"Protection"))
),
React.createElement("p",{className:"hero-copy"},
  React.createElement("span",{className:"hero-copy-line",style:{display:"block",whiteSpace:"nowrap"}},"Fire protection equipment and safety solutions"),
  React.createElement("span",{className:"hero-copy-line",style:{display:"block",whiteSpace:"nowrap"}},"engineered for the moments that matter.")
)
const heroLines = gsap.utils.toArray(".hero-title .hero-line");
const heroCopyLines = gsap.utils.toArray(".hero-copy .hero-copy-line");

gsap.set(heroLines, { opacity: 0, y: 18 });
gsap.set(heroCopyLines, { opacity: 0, y: 18 });
gsap.set(".actions", { opacity: 0, y: 18 });

const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
tl.to(heroLines, { opacity: 1, y: 0, duration: .65, stagger: .12 })
  .to(heroCopyLines, { opacity: 1, y: 0, duration: .65, stagger: .08 }, "-=.35")
  .to(".actions", { opacity: 1, y: 0, duration: .5 }, "-=.3");
