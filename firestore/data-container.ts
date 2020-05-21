import { DocumentReference } from "./document-reference";
import { CollectionReference } from "./collection-reference";

export interface DataContainer<T extends DocumentReference<any> | CollectionReference<any>> {
  children: Map<string, T>;
}
