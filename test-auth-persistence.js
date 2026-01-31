// Simple test to verify localStorage auth persistence
// This can be run in the browser console to test the functionality

function testAuthPersistence() {
  console.log('🧪 Testing Authentication Persistence...');
  
  // Test 1: Check if required keys exist after login
  const authSession = localStorage.getItem('auth_session');
  const authUser = localStorage.getItem('auth_user');
  const districtDomain = localStorage.getItem('district_domain');
  
  console.log('🔍 Storage Keys Check:', {
    hasAuthSession: !!authSession,
    hasAuthUser: !!authUser,
    hasDistrictDomain: !!districtDomain
  });
  
  if (authSession && authUser && districtDomain) {
    try {
      const session = JSON.parse(authSession);
      const user = JSON.parse(authUser);
      
      console.log('✅ Auth data found:', {
        sessionValid: session.isValid,
        username: user.username,
        loginTime: session.loginTime,
        districtDomain: districtDomain
      });
      
      // Test 2: Verify session structure
      const requiredSessionFields = ['isValid', 'password', 'loginTime', 'remember'];
      const hasAllSessionFields = requiredSessionFields.every(field => session.hasOwnProperty(field));
      
      const requiredUserFields = ['username', 'password', 'studentInfo'];
      const hasAllUserFields = requiredUserFields.every(field => user.hasOwnProperty(field));
      
      console.log('✅ Structure validation:', {
        sessionStructureValid: hasAllSessionFields,
        userStructureValid: hasAllUserFields
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error parsing auth data:', error);
      return false;
    }
  } else {
    console.log('ℹ️ No auth data found - user may not be logged in');
    return false;
  }
}

// Test logout functionality
function testAuthClear() {
  console.log('🧪 Testing Auth Clear...');
  
  const beforeKeys = {
    authSession: localStorage.getItem('auth_session'),
    authUser: localStorage.getItem('auth_user'),
    districtDomain: localStorage.getItem('district_domain'),
    savedAuth: localStorage.getItem('savedAuth')
  };
  
  console.log('🔍 Before clear:', {
    hasAuthSession: !!beforeKeys.authSession,
    hasAuthUser: !!beforeKeys.authUser,
    hasDistrictDomain: !!beforeKeys.districtDomain,
    hasSavedAuth: !!beforeKeys.savedAuth
  });
  
  // Simulate logout
  localStorage.removeItem('auth_session');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('district_domain');
  localStorage.removeItem('savedAuth');
  
  const afterKeys = {
    authSession: localStorage.getItem('auth_session'),
    authUser: localStorage.getItem('auth_user'),
    districtDomain: localStorage.getItem('district_domain'),
    savedAuth: localStorage.getItem('savedAuth')
  };
  
  const allCleared = !Object.values(afterKeys).some(val => val !== null);
  
  console.log('🔍 After clear:', {
    hasAuthSession: !!afterKeys.authSession,
    hasAuthUser: !!afterKeys.authUser,
    hasDistrictDomain: !!afterKeys.districtDomain,
    hasSavedAuth: !!afterKeys.savedAuth,
    allCleared
  });
  
  return allCleared;
}

// Export for use in browser console
window.testAuthPersistence = testAuthPersistence;
window.testAuthClear = testAuthClear;

console.log('🧪 Auth persistence test functions loaded. Use testAuthPersistence() and testAuthClear() in console.');
