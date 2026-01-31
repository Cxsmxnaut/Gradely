import { acc, loadStudentAccount } from '../account.svelte';
import { Operation, parseGradebookXML, unwrapEnvelope } from '../synergy';
import type { ReportPeriod } from '../types/Gradebook';

const LocalStorageKey = {
  STUDENT_ACCOUNT: 'studentAccount',
  GRADEBOOK: 'gradebook'
} as const;

interface GradebookRecord {
	xml: string;
	lastRefresh: number;
}

interface AttendanceRecord {
	xml: string;
	lastRefresh: number;
}

interface GradebookCatalogLocalStorageCache {
	recordCache: (null | GradebookRecord)[];
	defaultIndex: number;
	overrideIndex: number | null;
}

export interface GradebookCatalog {
	recordCache: (undefined | GradebookRecord)[];
	defaultIndex: number;
	overrideIndex?: number;
	loadingIndex?: number;
	receivingData?: boolean;
	canonicalReportPeriodEntries?: ReportPeriod[];
}

export function getGradebookCatalogFromLocalStorage() {
	const cacheStr = localStorage.getItem(LocalStorageKey.GRADEBOOK);
	if (cacheStr === null) return undefined;

	const cache: GradebookCatalogLocalStorageCache = JSON.parse(cacheStr);

	const defaultRecord = cache.recordCache[cache.defaultIndex];

	const canonicalReportPeriodEntries = defaultRecord
		? parseGradebookXML(defaultRecord.xml).ReportingPeriods.ReportPeriod
		: undefined;

	const gradebookCatalog: GradebookCatalog = {
		recordCache: cache.recordCache.map((record) => record ?? undefined),
		defaultIndex: cache.defaultIndex,
		overrideIndex: cache.overrideIndex ?? undefined,
		canonicalReportPeriodEntries
	};
	return gradebookCatalog;
}

export function saveGradebookCatalogToLocalStorage(gradebookCatalog: GradebookCatalog) {
	const cache: GradebookCatalogLocalStorageCache = {
		recordCache: gradebookCatalog.recordCache.map((record) => record ?? null),
		defaultIndex: gradebookCatalog.defaultIndex,
		overrideIndex: gradebookCatalog.overrideIndex ?? null
	};

	localStorage.setItem(LocalStorageKey.GRADEBOOK, JSON.stringify(cache));
}

export async function getAttendanceRecord(onReceivingData?: () => void) {
	// Ensure student account is loaded from localStorage
	if (!acc.studentAccount) {
		loadStudentAccount();
	}
	
	const { studentAccount } = acc;
	if (!studentAccount) {
		throw new Error('Cannot get synergy attendance: student account not loaded');
	}

	// attendance() returns parsed data directly, not a Response
	const attendanceData = await studentAccount.attendance();

	onReceivingData?.();

	// Convert the parsed data back to XML string for consistency
	const record: AttendanceRecord = {
		xml: JSON.stringify(attendanceData), // Store as JSON string since we already have parsed data
		lastRefresh: Date.now()
	};
	return record;
}

export async function getGradebookRecord(onReceivingData?: () => void, reportPeriod?: number) {
	// Ensure student account is loaded from localStorage
	if (!acc.studentAccount) {
		console.log('🔹 Student account not found, attempting to load from localStorage...');
		loadStudentAccount();
		
		// Wait and retry multiple times with longer delays
		let retries = 0;
		const maxRetries = 5;
		while (!acc.studentAccount && retries < maxRetries) {
			console.log(`🔹 Waiting for student account initialization... attempt ${retries + 1}/${maxRetries}`);
			await new Promise(resolve => setTimeout(resolve, 200 * (retries + 1)));
			retries++;
		}
	}
	
	const { studentAccount } = acc;
	if (!studentAccount) {
		// Debug: Check if localStorage has auth data
		const savedAuth = localStorage.getItem('savedAuth');
		console.error('❌ Cannot get synergy gradebook: student account not loaded');
		console.error('🔍 Debug - savedAuth exists:', !!savedAuth);
		if (savedAuth) {
			try {
				const parsed = JSON.parse(savedAuth);
				console.error('🔍 Debug - savedAuth structure:', {
					hasDistrictUrl: !!parsed.districtUrl,
					hasUsername: !!parsed.username,
					hasPassword: !!parsed.password
				});
			} catch (e) {
				console.error('🔍 Debug - savedAuth parse error:', e);
			}
		}
		throw new Error('Cannot get synergy gradebook: student account not loaded');
	}

	console.log('✅ Student account loaded successfully, fetching gradebook...');
	const res = await studentAccount.gradebookRequest(reportPeriod);

	onReceivingData?.();

	const envelopeStr = await res.text();

	const record: GradebookRecord = {
		xml: unwrapEnvelope(envelopeStr, Operation.Request),
		lastRefresh: Date.now()
	};
	return record;
}

export async function getInitialGradebookCatalog() {
	const defaultGradebookRecord = await getGradebookRecord();

	const defaultGradebook = parseGradebookXML(defaultGradebookRecord.xml);

	const canonicalReportPeriodEntries = defaultGradebook.ReportingPeriods.ReportPeriod;

	const reportingPeriods: (undefined | GradebookRecord)[] = Array(
		canonicalReportPeriodEntries.length
	).fill(undefined);

	const defaultIndex = parseInt(defaultGradebook.ReportingPeriod._Index);

	reportingPeriods[defaultIndex] = defaultGradebookRecord;

	const gradebookCatalog: GradebookCatalog = {
		recordCache: reportingPeriods,
		defaultIndex,
		canonicalReportPeriodEntries
	};
	return gradebookCatalog;
}

const cacheExpirationTime = 1000 * 60 * 5;

export const gradebookRefreshNeeded = (record: GradebookRecord) =>
	Date.now() - record.lastRefresh > cacheExpirationTime;
