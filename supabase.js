// Local Supabase Fallback Setup
window.supabase = {
    createClient: function(url, key) {
        console.log("Local Supabase mock initialized successfully!");
        return {
           auth: {
            getSession: async function() { 
                // 1. Check if we saved a login state in the browser
                const isLogged = localStorage.getItem('mock_logged_in');
                
                if (isLogged === 'true') {
                    return { 
                        data: { 
                            session: { 
                                user: { id: "mock-user-123", email: "developer@example.com" } 
                            } 
                        }, 
                        error: null 
                    };
                }
                return { data: { session: null }, error: null }; 
            },
            signInWithOAuth: async function(options) { 
                console.log("OAuth requested for:", options.provider);
                // 2. Set the login flag to true
                localStorage.setItem('mock_logged_in', 'true');
                // 3. Force the page to refresh so app.js checks the session again
                window.location.reload();
                return { data: {}, error: null }; 
            },
            signOut: async function() { 
                // 4. Clear the state when logging out
                localStorage.removeItem('mock_logged_in');
                return { error: null }; 
            }
        },
            from: function(tableName) {
                return {
                    // Saves the text input securely inside the browser's storage
                    upsert: async function(data) { 
                        console.log("Data saved to " + tableName + ":", data);
                        localStorage.setItem('mock_db_' + tableName, JSON.stringify(data));
                        return { error: null }; 
                    },
                    select: function(columns) {
                        return {
                            eq: function(colName, val) {
                                return {
                                    // Retrieves your saved text on page load
                                    single: async function() { 
                                        const rawData = localStorage.getItem('mock_db_' + tableName);
                                        const parsedData = rawData ? JSON.parse(rawData) : null;
                                        return { data: parsedData, error: null }; 
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };
    }
};