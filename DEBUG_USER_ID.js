// Temporary debug component - add this to your profile page to get your user ID
// Add this inside your profile page component

useEffect(() => {
  if (user) {
    console.log('User ID:', user.id);
    console.log('User Email:', user.email);
    console.log('Full User Object:', user);
  }
}, [user]);
