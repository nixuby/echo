// both inclusive
function randInt(from: number, to: number) {
    return from + Math.floor(Math.random() * (to - from + 1));
}

// Using pure HTML and avoiding React for performance
// Id - post id
export default function playButtonAnimation(
    id: string,
    btnContainerClass: string,
    colorClassName = 'bg-rose-500',
) {
    const container = document.getElementById(`post-controls-${id}`);
    if (!container) return;

    const likeButton = container.querySelector(btnContainerClass);
    if (!likeButton) return;

    const particleCount = randInt(5, 10);
    const color = colorClassName;
    const particles: Array<HTMLDivElement> = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(addParticle(color));
    }
    for (const particle of particles) {
        likeButton.appendChild(particle);
    }

    setTimeout(() => {
        for (const particle of particles) {
            particle.remove();
        }
    }, 600);
}

function addParticle(colorClassName: string) {
    const particle = document.createElement('div');
    particle.classList.add('_like-anim-particle', colorClassName);
    particle.style.setProperty('--target-x', randInt(-50, 50) + 'px');
    particle.style.setProperty('--target-y', randInt(-50, 50) + 'px');
    return particle;
}
