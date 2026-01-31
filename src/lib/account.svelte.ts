import { StudentAccount } from './synergy';

export const acc: { studentAccount?: StudentAccount } = {
  studentAccount: undefined
};

export const loadStudentAccount = () => {
	const savedAuth = localStorage.getItem('savedAuth');
	if (savedAuth === null) return;

	try {
		const credentials = JSON.parse(savedAuth);
		const {
			districtUrl: domain,
			username,
			password
		} = credentials;

		acc.studentAccount = new StudentAccount(domain, username, password);
	} catch (error) {
		console.error('Error loading student account:', error);
	}
};
