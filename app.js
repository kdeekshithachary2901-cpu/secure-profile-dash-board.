// =========================================================================
// 1. SUPABASE INITIALIZATION 
// =========================================================================
const supabaseUrl = 'https://supabase.co'; 
const supabaseKey = 'sb_publishable_Ls0bR8mzUx7KYuM6ZqEdpA_u18oB9wa'; 

// "createClient" is spelled perfectly here with a lowercase 't'
const mySupabase = supabase.createClient(supabaseUrl, supabaseKey);

// =========================================================================
// 2. DOM ELEMENT REFERENCES
// =========================================================================
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const profileSection = document.getElementById('profileSection');
const profileNameInput = document.getElementById('profileNameInput');
const profileBioInput = document.getElementById('profileBioInput');

let currentUser = null;

// Handle GitHub Sign-In
loginBtn.addEventListener('click', async () => {
    const { error } = await mySupabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.href 
        }
    });
    if (error) console.error('Login Error:', error.message);
});

// Handle Sign-Out
logoutBtn.addEventListener('click', async () => {
    await mySupabase.auth.signOut();
    window.location.reload();
});

// Check Session Authentication State on Page Load
async function checkUserSession() {
    const { data: { session } } = await mySupabase.auth.getSession();
    
    if (session && session.user) {
        currentUser = session.user;
        loginBtn.style.display = 'none';
        profileSection.style.display = 'block';
        fetchProfileData(currentUser.id);
    }
}

// Save profile entries to table
saveProfileBtn.addEventListener('click', async () => {
    if (!currentUser) {
        alert('You must be logged in to save profile data!');
        return;
    }

    const { error } = await mySupabase
        .from('profiles')
        .upsert({
            id: currentUser.id,
            full_name: profileNameInput.value,
            bio: profileBioInput.value,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error saving profile data:', error.message);
        alert('Database Error: ' + error.message);
    } else {
        alert('Profile saved successfully!');
    }
});

// Retrieve existing user database entries if available
async function fetchProfileData(userId) {
    const { data, error } = await mySupabase
        .from('profiles')
        .select('full_name, bio')
        .eq('id', userId)
        .single();

    if (data && !error) {
        profileNameInput.value = data.full_name || '';
        profileBioInput.value = data.bio || '';
    }
}

checkUserSession();