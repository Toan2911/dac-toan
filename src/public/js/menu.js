document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });

    const closeMenuButton = document.getElementById('close-menu-button');
    closeMenuButton.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
    });
}); 