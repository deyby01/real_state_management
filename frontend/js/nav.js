const userToggle = document.querySelector(".user-menu-toggle");
const userPanel = document.querySelector('.user-menu-panel');
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

if (userToggle && userPanel) {
    userToggle.addEventListener('click', function () {
        userPanel.classList.toggle('is-open');
    });
}

document.addEventListener('click', function(event) {
    if (userPanel && !event.target.closest('.user-menu')) {
        userPanel.classList.remove('is-open');
    }
});

if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('is-open');
        const icon = navToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
    });
}

const aboutToggle = document.querySelector('.about-nav-toggle');
const aboutMenu = document.querySelector('.about-nav-menu');

if (aboutToggle && aboutMenu) {
    aboutToggle.addEventListener('click', function() {
        aboutMenu.classList.toggle('is-open');
        aboutToggle.querySelector('i').classList.toggle('fa-bars');
        aboutToggle.querySelector('i').classList.toggle('fa-xmark');
    });
}
