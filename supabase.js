// Local Supabase Fallback Setup
window.supabase = {
    createClient: function(url, key) {
        console.log("Local Supabase mock initialized successfully!");
        return {
            auth: {
                getSession: async function() { 
                    return { data: { session: null }, error: null }; 
                },
                signInWithOAuth: async function(options) { 
                    console.log("OAuth requested for:", options.provider);
                    return { data: {}, error: null }; 
                },
                signOut: async function() { 
                    return { error: null }; 
                }
            },
            from: function(tableName) {
                return {
                    upsert: async function(data) { 
                        console.log("Data sent to " + tableName + ":", data);
                        return { error: null }; 
                    },
                    select: function(columns) {
                        return {
                            eq: function(colName, val) {
                                return {
                                    single: async function() { 
                                        return { data: null, error: null }; 
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
