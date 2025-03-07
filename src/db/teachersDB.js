import { getFromIndexedDB, saveToIndexedDB } from "./indexedDB";

const STORE_NAME = "teachers";

// ✅ Get teachers from IndexedDB
export const getTeachersFromDB = async () => getFromIndexedDB(STORE_NAME);

// ✅ Save teachers to IndexedDB
export const saveTeachersToDB = async (teachers) => saveToIndexedDB(STORE_NAME, teachers);

// ✅ Clear and update teachers in IndexedDB
// export const updateTeachersDB = async (teachers) => updateTeachersDB(STORE_NAME, teachers);
// nd update teachers in IndexedDB
export const updateTeachersDB = async (teachers) => {

    return saveToIndexedDB(STORE_NAME, teachers); // Correctly call saveToIndexedDB
};
