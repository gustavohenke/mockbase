import { DocumentReference } from "./document-reference";
import { CollectionReference } from "./collection-reference";

export interface DataContainer<T = DocumentReference | CollectionReference> {
  children: Map<string, T>;
}
