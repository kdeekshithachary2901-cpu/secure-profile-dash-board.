// 1. Initialize Supabase Connection (Fixed Variable Name)
const SUPABASE_URL = "https://supabase.com/dashboard/project/lfbrwpfstkfshavbxiqh/settings/api-keys" 
const SUPABASE_ANON_KEY = "sb_publishable_Ls0bR8mzUx7KYuM6ZqEdpA_u18oB9wa" 

const mySupabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 2. Grab DOM elements
const loginView = document.getElementById('login-view')
const dashboardView = document.getElementById('dashboard-view')
const loginBtn = document.getElementById('login-btn')
const logoutBtn = document.getElementById('logout-btn')
const userEmailText = document.getElementById('user-email')

// 3. Login Action Functionality via GitHub OAuth
loginBtn.addEventListener('click', async () => {
    const { error } = await mySupabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.origin
        }
    })
    if (error) console.error('Error logging in:', error.message)
})

// 4. Logout Action Functionality
logoutBtn.addEventListener('click', async () => {
    const { error } = await mySupabase.auth.signOut()
    if (!error) window.location.reload()
})

// 5. Monitor authentication state transitions
// 5. Monitor authentication state transitions & load profile data dynamically
mySupabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        // A. Toggle UI Views
        loginView.classList.add('hidden')
        dashboardView.classList.remove('hidden')
        userEmailText.innerText = `Logged in as: ${session.user.email}`

        // B. Fetch saved profile row data from Supabase
        const { data, error } = await mySupabase
            .from('profiles')
            .select('full_name, bio')
            .eq('id', session.user.id)
            .single() // Expecting exactly 1 profile matching this unique User ID

        // C. If data exists, automatically populate the dashboard text boxes!
        if (data && !error) {
            profileNameInput.value = data.full_name || ''
            profileBioInput.value = data.bio || ''
        } else if (error && error.code !== 'PGRST116') {
            // PGRST116 just means "no profile row found yet", which is normal for brand new users
            console.error('Error downloading profile data:', error.message)
        }
    } else {
        // User logged out - clean views
        loginView.classList.remove('hidden')
        dashboardView.classList.add('hidden')
        profileNameInput.value = ''
        profileBioInput.value = ''
    }
})
// 6. Grab Profile UI Inputs
const profileNameInput = document.getElementById('profile-name')
const profileBioInput = document.getElementById('profile-bio')
const saveProfileBtn = document.getElementById('save-profile-btn')

// 7. Save Profile Changes to Supabase Database
saveProfileBtn.addEventListener('click', async () => {
    // Get the currently authenticated user session details
    const { data: { user } } = await mySupabase.auth.getUser()
    
    if (!user) {
        alert('You must be logged in to save profile data!')
        return
    }

    // Upsert means: Update if the profile exists, otherwise Insert a new one
    const { error } = await mySupabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: profileNameInput.value,
            bio: profileBioInput.value,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error saving profile:', error.message)
        alert('Error saving data: ' + error.message)
    } else {
        alert('Profile saved successfully to your secure database!');
    }
})