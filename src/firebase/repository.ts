import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  type DocumentData
} from 'firebase/firestore';
import { getDb } from './app';
import type { CollectionName } from './collections';
import { docToRecord, newId, stripUndefined, toIso } from './helpers';

export class FirestoreRepo {
  constructor(private readonly name: CollectionName) {}

  private col() {
    return collection(getDb(), this.name);
  }

  async getAll(): Promise<Record<string, unknown>[]> {
    const snap = await getDocs(this.col());
    return snap.docs.map((d) => docToRecord(d.id, d.data() as Record<string, unknown>));
  }

  async getById(id: string): Promise<Record<string, unknown> | null> {
    const snap = await getDoc(doc(getDb(), this.name, id));
    if (!snap.exists()) return null;
    return docToRecord(snap.id, snap.data() as Record<string, unknown>);
  }

  async findByField(field: string, value: unknown): Promise<Record<string, unknown> | null> {
    const rows = await this.getAll();
    return rows.find((r) => r[field] === value) ?? null;
  }

  async save(id: string | undefined, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const docId = id || newId();
    const existing = id ? await this.getById(id) : null;
    const now = new Date();
    const payload = stripUndefined({
      ...data,
      id: undefined,
      createdAt: existing?.createdAt ?? data.createdAt ?? now,
      updatedAt: now,
      dataCadastro: existing?.dataCadastro ?? data.dataCadastro ?? now,
      ultimaAtualizacao: now
    }) as DocumentData;

    await setDoc(doc(getDb(), this.name, docId), payload, { merge: true });
    const saved = await this.getById(docId);
    return saved ?? { id: docId, ...payload, createdAt: toIso(now), updatedAt: toIso(now) };
  }

  async update(id: string, partial: Record<string, unknown>): Promise<Record<string, unknown>> {
    const payload = stripUndefined({ ...partial, updatedAt: new Date(), ultimaAtualizacao: new Date() });
    await updateDoc(doc(getDb(), this.name, id), payload as DocumentData);
    const updated = await this.getById(id);
    if (!updated) throw new Error('Documento não encontrado após update');
    return updated;
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(getDb(), this.name, id));
  }

  async count(): Promise<number> {
    const snap = await getDocs(this.col());
    return snap.size;
  }
}
