async function loadHeader() {
    try{

        console.log('entered')
        // Check if the header is already loaded
    
        // Load the header HTML
        console.log('fetching....')
        const headerResponse = await fetch('/header');
        const headerHtml = await headerResponse.text();
        document.querySelector('.header-container').innerHTML = headerHtml;
        // localStorage.setItem('headerLoaded', true);
    
        // Load user details
        await loadUserDetails();
    
        // Set up logout functionality
        // document.querySelector('.logout-btn').onclick = logout;
    }catch(e){
        console.error('error in loading header..',e)
    }
}

async function loadUserDetails() {
    // Check if user data is cached
    let nursenme = JSON.parse(localStorage.getItem('nursenme'));

    // If not cached, fetch from the server
    if (!nursenme) {
        const response = await fetch('/user/nursenme/');
        nursenme = await response.json();
        localStorage.setItem('nursenme', JSON.stringify(nursenme));
    }

    console.log('Fetched User:', nursenme.user);

    // Get user initials and display them
    const abbrievs = nursenme.user._id.slice(0, 2);
    localStorage.setItem('myinitials', abbrievs);

    document.querySelector('.user-initials').textContent = abbrievs;
    
}

function logout() {
    console.log("User logged out");
    localStorage.removeItem('headerLoaded');
    localStorage.removeItem('myinitials');
    localStorage.removeItem('nursenme');
    window.location.href = '/user/logout';
}

// Load header on page load
window.onload = loadHeader;
