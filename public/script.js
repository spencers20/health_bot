document.querySelectorAll('.suggestions button').forEach(button => {
    button.addEventListener('click', () => {
        console.log('clicked')
        alert(`Feature: ${button.textContent}`);
    });
});
