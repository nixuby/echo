// both inclusive
function randInt(from: number, to: number) {
    return from + Math.floor(Math.random() * (to - from + 1));
}

// Using pure HTML and avoiding React for performance
// Id - post id
export default function playLikeAnimation(id: string) {
    const container = document.getElementById(`post-controls-${id}`);
    if (!container) return;

    const likeButton = container.querySelector('.__like-btn-container');
    if (!likeButton) return;

    const particleCount = randInt(5, 10);
    const particles = Array.from({ length: particleCount }, addParticle);

    for (const particle of particles) {
        likeButton.appendChild(particle);
    }

    setTimeout(() => {
        for (const particle of particles) {
            particle.remove();
        }
    }, 600);
}

function addParticle() {
    const particle = document.createElement('div');
    particle.className = '_like-anim-particle';
    particle.style.setProperty('--target-x', randInt(-50, 50) + 'px');
    particle.style.setProperty('--target-y', randInt(-50, 50) + 'px');
    return particle;
}
