const slider = document.querySelector('.slider');
const track  = document.querySelector('.slide-track');
const dotsBox = document.querySelector('.dots');
const total  = track.children.length;          // real images only

// build one dot per image
for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.addEventListener('click', () => {
        goTo(i);
        restartAuto();
    });
    dotsBox.appendChild(dot);
}
const dots = document.querySelectorAll('.dot');

// clone the first image onto the end so the loop is seamless
track.appendChild(track.children[0].cloneNode(true));

let index = 0;
let timer;

function updateDots() {
    dots.forEach(d => d.classList.remove('active'));
    dots[index % total].classList.add('active');   // clone counts as slide 0
}

function goTo(i) {
    track.style.transition = 'transform 2.0s ease';
    index = i;
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
}

function next() {
    if (index < total) goTo(index + 1);
}

function prev() {
    if (index === 0) {
        // jump instantly to the clone at the end, then slide back one
        track.style.transition = 'none';
        index = total;
        track.style.transform = `translateX(-${index * 100}%)`;
        track.offsetWidth;                         // force the browser to apply the jump
    }
    goTo(index - 1);
}

// after sliding onto the clone, silently snap back to the real first image
track.addEventListener('transitionend', (e) => {
    if (e.target === track && index === total) {
        track.style.transition = 'none';
        index = 0;
        track.style.transform = 'translateX(0)';
        updateDots();
    }
});

function startAuto()   { timer = setInterval(next, 10000); }
function stopAuto()    { clearInterval(timer); }
function restartAuto() { stopAuto(); startAuto(); }

document.querySelector('.next').addEventListener('click', () => { next(); restartAuto(); });
document.querySelector('.prev').addEventListener('click', () => { prev(); restartAuto(); });

slider.addEventListener('mouseenter', stopAuto);
slider.addEventListener('mouseleave', startAuto);

updateDots();
startAuto();