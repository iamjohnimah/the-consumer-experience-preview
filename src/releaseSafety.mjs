export const BACKUP_KEY='spreeai-before-build-2026.10.16.01';
export function backupBeforeRelease(storage,key){try{if(storage.getItem(BACKUP_KEY)!==null)return true;const previous=storage.getItem(key);if(previous===null)return true;storage.setItem(BACKUP_KEY,previous);return true}catch{return false}}
