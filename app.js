// 1. Initialize Supabase Connection
const SUPABASE_URL = "https://supabase.co" 
const SUPABASE_ANON_KEY = "PASTE_YOUR_LONG_ANON_PUBLIC_KEY_HERE" // Put your real key here!

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 2. Grab DOM elements
const loginView = document.getElementById('login-view')
const dashboardView = document.getElementById('dashboard-view')
const loginBtn = document.getElementById('login-btn')
const logoutBtn = document.getElementById('logout-btn')
const userEmailText = document.getElementById('user-email')

// 3. Login Action Functionality via GitHub OAuth
loginBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.origin
        }
    })
    if (error) console.error('Error logging in:', error.message)
})

// 4. Logout Action Functionality
logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) window.location.reload()
})

// 5. Monitor authentication state transitions
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        loginView.classList.add('hidden')
        dashboardView.classList.remove('hidden')
        userEmailText.innerText = `Logged in as: ${session.user.email}`
    } else {
        loginView.classList.remove('hidden')
        dashboardView.classList.add('hidden')
    }
})
