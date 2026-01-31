import { StudentAccount } from './synergy';

export const acc: { studentAccount?: StudentAccount } = {
  studentAccount: undefined
};

export const loadStudentAccount = () => {
	console.log('🔹 Loading student account from localStorage...');
	const savedAuth = localStorage.getItem('savedAuth');
	if (savedAuth === null) {
		console.warn('🔹 No saved authentication found in localStorage');
		return;
	}

	try {
		const credentials = JSON.parse(savedAuth);
		const {
			districtUrl: domain,
			username,
			password
		} = credentials;

		if (!domain || !username || !password) {
			console.error('❌ Invalid credentials structure:', {
				hasDomain: !!domain,
				hasUsername: !!username,
				hasPassword: !!password
			});
			return;
		}

		console.log('🔹 Creating StudentAccount with credentials for user:', username);
		acc.studentAccount = new StudentAccount(domain, username, password);
		console.log('✅ StudentAccount created successfully');
	} catch (error) {
		console.error('❌ Error loading student account:', error);
		// Clear invalid auth data
		localStorage.removeItem('savedAuth');
	}
};
