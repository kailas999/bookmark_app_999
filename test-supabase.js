#!/usr/bin/env node

/**
 * Test Supabase Connection
 * Run: node test-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...\n')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET')
console.log()

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials not found in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    try {
        // Test 1: Check if we can connect
        console.log('Test 1: Checking connection...')
        const { data, error } = await supabase.from('bookmarks').select('count')

        if (error && error.code === '42P01') {
            console.log('⚠️  Database connected, but tables not found')
            console.log('   Please run the SQL schema in Supabase SQL Editor')
            console.log('   File: supabase-schema.sql\n')
            return
        }

        if (error) {
            console.error('❌ Connection failed:', error.message)
            return
        }

        console.log('✅ Successfully connected to Supabase!')
        console.log(`   Found ${data?.length || 0} bookmarks\n`)

        // Test 2: Check auth configuration
        console.log('Test 2: Checking auth providers...')
        const { data: authData, error: authError } = await supabase.auth.getSession()

        if (authError) {
            console.log('⚠️  Auth check:', authError.message)
        } else {
            console.log('✅ Auth is configured')
            console.log('   Session:', authData.session ? 'Active' : 'None (expected before login)')
        }

        console.log('\n🎉 Supabase is ready!')
        console.log('\n📋 Next steps:')
        console.log('1. Make sure you ran the SQL schema (supabase-schema.sql)')
        console.log('2. Configure Google OAuth in Supabase dashboard')
        console.log('3. Visit http://localhost:3000 to test login')

    } catch (err) {
        console.error('❌ Unexpected error:', err.message)
    }
}

testConnection()
