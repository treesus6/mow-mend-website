import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  normalizeLeadStatus,
  type BookedSlotRecord,
  type EstimatePhotoRecord,
  type EstimateRequestRecord,
  type JobExpenseRecord,
  type JobPaymentRecord,
  type LeadContactRecord,
  type LeadStatus,
  type NotificationStatus,
  type PricingOverrideRecord,
  type QuoteDocumentRecord,
  type ServiceOverrideRecord,
} from '../types/estimate.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionTested = false;
export async function testConnection(): Promise<void> {
  if (connectionTested) return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export interface CompressedPhotoPayload {
  photoId: string;
  fileName: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  dataUrl: string;
  sizeBytes: number;
}

export async function saveEstimateLeadToFirestore(params: {
  requestId: string;
  lead: Omit<
    EstimateRequestRecord,
    'requestId' | 'status' | 'notificationStatus' | 'photoCount' | 'createdAt' | 'updatedAt'
  > & { services: string[] };
  notificationStatus: NotificationStatus;
  photos: CompressedPhotoPayload[];
}): Promise<void> {
  const { requestId, lead, notificationStatus, photos } = params;
  const leadPath = `estimateRequests/${requestId}`;

  try {
    const batch = writeBatch(db);
    const leadRef = doc(db, 'estimateRequests', requestId);

    batch.set(leadRef, {
      requestId,
      customerName: lead.customerName,
      phone: lead.phone,
      email: lead.email,
      preferredContact: lead.preferredContact,
      services: lead.services,
      serviceType: lead.serviceType,
      streetAddress: lead.streetAddress,
      city: lead.city,
      zipCode: lead.zipCode,
      description: lead.description,
      debrisHauling: lead.debrisHauling,
      preferredDate: lead.preferredDate || '',
      preferredTimeframe: lead.preferredTimeframe,
      additionalDetails: lead.additionalDetails || '',
      photoCount: photos.length,
      status: 'New',
      notificationStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    for (const photo of photos) {
      const photoRef = doc(db, 'estimateRequests', requestId, 'photos', photo.photoId);
      batch.set(photoRef, {
        photoId: photo.photoId,
        requestId,
        fileName: photo.fileName,
        mimeType: photo.mimeType,
        dataUrl: photo.dataUrl,
        sizeBytes: photo.sizeBytes,
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, leadPath);
  }
}

export async function fetchAllEstimateLeads(): Promise<EstimateRequestRecord[]> {
  const path = 'estimateRequests';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as EstimateRequestRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchEstimatePhotos(requestId: string): Promise<EstimatePhotoRecord[]> {
  const path = `estimateRequests/${requestId}/photos`;
  try {
    const snapshot = await getDocs(collection(db, 'estimateRequests', requestId, 'photos'));
    return snapshot.docs.map((d) => d.data() as EstimatePhotoRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateEstimateLeadAdminFields(
  requestId: string,
  updates: {
    status: LeadStatus;
    internalNotes?: string;
    estimateAmount?: string;
    followUpDate?: string;
  }
): Promise<void> {
  const path = `estimateRequests/${requestId}`;
  try {
    await updateDoc(doc(db, 'estimateRequests', requestId), {
      status: normalizeLeadStatus(updates.status),
      internalNotes: (updates.internalNotes ?? '').slice(0, 4000),
      estimateAmount: (updates.estimateAmount ?? '').slice(0, 40),
      followUpDate: (updates.followUpDate ?? '').slice(0, 20),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

async function commitBatchedDeletes(refs: DocumentReference[]): Promise<void> {
  const CHUNK_SIZE = 400;
  for (let i = 0; i < refs.length; i += CHUNK_SIZE) {
    const chunk = refs.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const ref of chunk) {
      batch.delete(ref);
    }
    await batch.commit();
  }
}

/**
 * Deletes a lead along with every compressed photo document (where the photo bytes/dataUrl
 * are stored), quotes/invoices, payments, expenses, contact logs, and any booked schedule slot.
 */
export async function deleteEstimateLead(requestId: string): Promise<void> {
  const path = `estimateRequests/${requestId}`;
  try {
    const subcollections = ['photos', 'quotes', 'payments', 'expenses', 'contacts'] as const;
    const refsToDelete: DocumentReference[] = [];

    for (const sub of subcollections) {
      const snap = await getDocs(collection(db, 'estimateRequests', requestId, sub));
      for (const docItem of snap.docs) {
        refsToDelete.push(docItem.ref);
      }
    }

    const slotSnap = await getDocs(
      query(collection(db, 'bookedSlots'), where('requestId', '==', requestId))
    );
    for (const slotDoc of slotSnap.docs) {
      refsToDelete.push(slotDoc.ref);
    }

    refsToDelete.push(doc(db, 'estimateRequests', requestId));
    await commitBatchedDeletes(refsToDelete);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------- Public Catalog Overrides (Owner Edit -> Public Site Reflects) ----------

export function subscribeCatalogOverrides(
  onServices: (map: Record<string, ServiceOverrideRecord>) => void,
  onPricing: (map: Record<string, PricingOverrideRecord>) => void
): () => void {
  const unsubServices = onSnapshot(
    collection(db, 'serviceCatalog'),
    (snapshot) => {
      const next: Record<string, ServiceOverrideRecord> = {};
      for (const docItem of snapshot.docs) {
        next[docItem.id] = docItem.data() as ServiceOverrideRecord;
      }
      onServices(next);
    },
    (error) => {
      console.warn('Service catalog listener fallback to defaults:', error.message);
    }
  );

  const unsubPricing = onSnapshot(
    collection(db, 'pricingCatalog'),
    (snapshot) => {
      const next: Record<string, PricingOverrideRecord> = {};
      for (const docItem of snapshot.docs) {
        next[docItem.id] = docItem.data() as PricingOverrideRecord;
      }
      onPricing(next);
    },
    (error) => {
      console.warn('Pricing catalog listener fallback to defaults:', error.message);
    }
  );

  return () => {
    unsubServices();
    unsubPricing();
  };
}

export async function saveServiceOverride(override: {
  serviceId: string;
  title: string;
  shortTitle: string;
  oneLiner: string;
}): Promise<void> {
  const path = `serviceCatalog/${override.serviceId}`;
  try {
    await setDoc(doc(db, 'serviceCatalog', override.serviceId), {
      serviceId: override.serviceId,
      title: override.title.trim().slice(0, 140),
      shortTitle: override.shortTitle.trim().slice(0, 80),
      oneLiner: override.oneLiner.trim().slice(0, 400),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteServiceOverride(serviceId: string): Promise<void> {
  const path = `serviceCatalog/${serviceId}`;
  try {
    await deleteDoc(doc(db, 'serviceCatalog', serviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function savePricingOverride(override: {
  pricingKey: string;
  label: string;
  startingDisplay: string;
  notes: string;
}): Promise<void> {
  const path = `pricingCatalog/${override.pricingKey}`;
  try {
    await setDoc(doc(db, 'pricingCatalog', override.pricingKey), {
      pricingKey: override.pricingKey,
      label: override.label.trim().slice(0, 160),
      startingDisplay: override.startingDisplay.trim().slice(0, 160),
      notes: override.notes.trim().slice(0, 400),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePricingOverride(pricingKey: string): Promise<void> {
  const path = `pricingCatalog/${pricingKey}`;
  try {
    await deleteDoc(doc(db, 'pricingCatalog', pricingKey));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------- Estimates & Invoices (Subcollection quotes) ----------

export async function fetchLeadQuotes(requestId: string): Promise<QuoteDocumentRecord[]> {
  const path = `estimateRequests/${requestId}/quotes`;
  try {
    const snapshot = await getDocs(
      query(collection(db, path), where('requestId', '==', requestId))
    );
    const docs = snapshot.docs.map((d) => d.data() as QuoteDocumentRecord);
    return docs.sort((a, b) => (a.docNumber < b.docNumber ? 1 : -1));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveLeadQuoteDocument(
  record: Omit<QuoteDocumentRecord, 'createdAt' | 'updatedAt'>
): Promise<void> {
  const path = `estimateRequests/${record.requestId}/quotes/${record.docId}`;
  const ref = doc(db, 'estimateRequests', record.requestId, 'quotes', record.docId);
  try {
    const existingSnap = await getDoc(ref);
    await setDoc(ref, {
      ...record,
      notes: record.notes.slice(0, 2000),
      createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteLeadQuoteDocument(requestId: string, docId: string): Promise<void> {
  const path = `estimateRequests/${requestId}/quotes/${docId}`;
  try {
    await deleteDoc(doc(db, 'estimateRequests', requestId, 'quotes', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------- Payments ----------

export async function fetchLeadPayments(requestId: string): Promise<JobPaymentRecord[]> {
  const path = `estimateRequests/${requestId}/payments`;
  try {
    const snapshot = await getDocs(
      query(collection(db, path), where('requestId', '==', requestId))
    );
    return snapshot.docs
      .map((d) => d.data() as JobPaymentRecord)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addLeadPayment(
  payment: Omit<JobPaymentRecord, 'createdAt'>
): Promise<void> {
  const path = `estimateRequests/${payment.requestId}/payments/${payment.paymentId}`;
  try {
    await setDoc(doc(db, 'estimateRequests', payment.requestId, 'payments', payment.paymentId), {
      ...payment,
      note: payment.note.slice(0, 500),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteLeadPayment(requestId: string, paymentId: string): Promise<void> {
  const path = `estimateRequests/${requestId}/payments/${paymentId}`;
  try {
    await deleteDoc(doc(db, 'estimateRequests', requestId, 'payments', paymentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------- Materials & Expenses ----------

export async function fetchLeadExpenses(requestId: string): Promise<JobExpenseRecord[]> {
  const path = `estimateRequests/${requestId}/expenses`;
  try {
    const snapshot = await getDocs(
      query(collection(db, path), where('requestId', '==', requestId))
    );
    return snapshot.docs
      .map((d) => d.data() as JobExpenseRecord)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addLeadExpense(
  expense: Omit<JobExpenseRecord, 'createdAt'>
): Promise<void> {
  const path = `estimateRequests/${expense.requestId}/expenses/${expense.expenseId}`;
  try {
    await setDoc(doc(db, 'estimateRequests', expense.requestId, 'expenses', expense.expenseId), {
      ...expense,
      description: expense.description.trim().slice(0, 200),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteLeadExpense(requestId: string, expenseId: string): Promise<void> {
  const path = `estimateRequests/${requestId}/expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'estimateRequests', requestId, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------- Customer Contact History ----------

export async function fetchLeadContacts(requestId: string): Promise<LeadContactRecord[]> {
  const path = `estimateRequests/${requestId}/contacts`;
  try {
    const snapshot = await getDocs(
      query(collection(db, path), where('requestId', '==', requestId))
    );
    return snapshot.docs
      .map((d) => d.data() as LeadContactRecord)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addLeadContact(
  contact: Omit<LeadContactRecord, 'createdAt'>
): Promise<void> {
  const path = `estimateRequests/${contact.requestId}/contacts/${contact.contactId}`;
  try {
    await setDoc(doc(db, 'estimateRequests', contact.requestId, 'contacts', contact.contactId), {
      ...contact,
      note: contact.note.trim().slice(0, 1000),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteLeadContact(requestId: string, contactId: string): Promise<void> {
  const path = `estimateRequests/${requestId}/contacts/${contactId}`;
  try {
    await deleteDoc(doc(db, 'estimateRequests', requestId, 'contacts', contactId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ---------- Scheduling & Double-Booking Prevention ----------

export function makeSlotKey(scheduledDate: string, scheduledTime: string): string {
  const cleanDate = scheduledDate.replace(/[^0-9]/g, '');
  const cleanTime = scheduledTime.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${cleanDate}_${cleanTime}`.slice(0, 80);
}

export async function fetchAllBookedSlots(): Promise<BookedSlotRecord[]> {
  const path = 'bookedSlots';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs
      .map((d) => d.data() as BookedSlotRecord)
      .sort((a, b) =>
        `${a.scheduledDate} ${a.scheduledTime}`.localeCompare(`${b.scheduledDate} ${b.scheduledTime}`)
      );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function scheduleLeadSlot(params: {
  lead: EstimateRequestRecord;
  scheduledDate: string;
  scheduledTime: string;
  nextStatus?: LeadStatus;
}): Promise<{ slot: BookedSlotRecord; status: LeadStatus }> {
  const { lead, scheduledDate, scheduledTime } = params;
  const newSlotKey = makeSlotKey(scheduledDate, scheduledTime);
  const newSlotRef = doc(db, 'bookedSlots', newSlotKey);
  const leadRef = doc(db, 'estimateRequests', lead.requestId);
  const statusToSet = params.nextStatus ?? normalizeLeadStatus(lead.status);

  try {
    await runTransaction(db, async (tx) => {
      const existingSlotSnap = await tx.get(newSlotRef);
      if (existingSlotSnap.exists()) {
        const existingData = existingSlotSnap.data() as BookedSlotRecord;
        if (existingData.requestId !== lead.requestId) {
          throw new Error(
            `DOUBLE_BOOKED: Slot ${scheduledDate} at ${scheduledTime} is already booked for ${existingData.requestId} (${existingData.customerName}). Please choose a different day or time slot.`
          );
        }
      }

      if (lead.scheduledSlotKey && lead.scheduledSlotKey !== newSlotKey) {
        const oldSlotRef = doc(db, 'bookedSlots', lead.scheduledSlotKey);
        const oldSnap = await tx.get(oldSlotRef);
        if (oldSnap.exists() && (oldSnap.data() as BookedSlotRecord).requestId === lead.requestId) {
          tx.delete(oldSlotRef);
        }
      }

      tx.set(newSlotRef, {
        slotKey: newSlotKey,
        requestId: lead.requestId,
        customerName: lead.customerName,
        city: lead.city,
        scheduledDate,
        scheduledTime,
        updatedAt: serverTimestamp(),
      });

      tx.update(leadRef, {
        scheduledDate,
        scheduledTime,
        scheduledSlotKey: newSlotKey,
        status: statusToSet,
        updatedAt: serverTimestamp(),
      });
    });

    return {
      slot: {
        slotKey: newSlotKey,
        requestId: lead.requestId,
        customerName: lead.customerName,
        city: lead.city,
        scheduledDate,
        scheduledTime,
      },
      status: statusToSet,
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('DOUBLE_BOOKED:')) {
      throw new Error(error.message.replace('DOUBLE_BOOKED: ', ''));
    }
    handleFirestoreError(error, OperationType.WRITE, `bookedSlots/${newSlotKey}`);
  }
}

export async function clearLeadScheduleSlot(lead: EstimateRequestRecord): Promise<void> {
  const leadRef = doc(db, 'estimateRequests', lead.requestId);
  try {
    await runTransaction(db, async (tx) => {
      if (lead.scheduledSlotKey) {
        const oldRef = doc(db, 'bookedSlots', lead.scheduledSlotKey);
        const snap = await tx.get(oldRef);
        if (snap.exists() && (snap.data() as BookedSlotRecord).requestId === lead.requestId) {
          tx.delete(oldRef);
        }
      }
      tx.update(leadRef, {
        scheduledDate: '',
        scheduledTime: '',
        scheduledSlotKey: '',
        updatedAt: serverTimestamp(),
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `estimateRequests/${lead.requestId}`);
  }
}
